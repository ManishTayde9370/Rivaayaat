const cron = require('node-cron');
const Product = require('../model/Product');
const ScheduledExport = require('../model/ScheduledExport');
const nodemailer = require('nodemailer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const jobs = new Map();

const ScheduledExportRun = require('../model/ScheduledExportRun');

const buildCsv = async () => {
  const products = await Product.find().lean();
  const headers = ["_id","name","description","price","stock","category","artisanName","averageRating","numReviews","images"];
  const escape = (val) => {
    if (val === undefined || val === null) return '';
    const s = String(val);
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const rows = products.map(p => {
    return [
      escape(p._id),
      escape(p.name),
      escape(p.description),
      escape(p.price),
      escape(p.stock),
      escape(p.category),
      escape(p.artisanName || ''),
      escape(p.averageRating || 0),
      escape(p.numReviews || 0),
      escape((p.images || []).join('|'))
    ].join(',');
  });
  return headers.join(',') + "\n" + rows.join('\n');
};

const sendEmail = async (recipients, csvContent, name) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  if (!emailUser || !emailPass) {
    console.warn('EMAIL_USER or EMAIL_PASS not set. Skipping scheduled export email.');
    return;
  }
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: emailUser, pass: emailPass } });
  try {
    await transporter.sendMail({
      from: `"Rivaayaat" <${emailUser}>`,
      to: recipients.join(','),
      subject: `Scheduled export: ${name}`,
      text: `Attached is the scheduled products export (${name}).`,
      attachments: [{ filename: `${name || 'products'}.csv`, content: csvContent }]
    });
    console.log('✅ Scheduled export email sent to', recipients);
  } catch (err) {
    console.error('❌ Failed to send scheduled export email:', err.message);
  }
};

const uploadS3 = async (bucket, prefix, content, name) => {
  const region = process.env.AWS_REGION;
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !region) {
    console.warn('AWS credentials not configured. Skipping S3 upload.');
    return;
  }
  const client = new S3Client({ region });
  const key = `${prefix || ''}${name || 'products'}.csv`;
  try {
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: content, ContentType: 'text/csv' }));
    console.log('✅ Uploaded export to s3://%s/%s', bucket, key);
  } catch (err) {
    console.error('❌ Failed to upload to S3:', err.message);
  }
};

const runJob = async (schedule, opts = {}) => {
  const attempt = opts.attempt || 1;
  const retryOf = opts.retryOf || null;
  const runDoc = new ScheduledExportRun({ schedule: schedule._id, attempt, status: 'running', startedAt: new Date(), details: { retryOf } });
  await runDoc.save();

  try {
    console.log('🔁 Running scheduled export:', schedule.name, 'attempt', attempt);
    const csv = await buildCsv();
    let details = { size: csv.length };
    if (schedule.destination === 'email' && Array.isArray(schedule.emails) && schedule.emails.length > 0) {
      await sendEmail(schedule.emails, csv, schedule.name);
      details.recipients = (schedule.emails || []).length;
    }
    if (schedule.destination === 's3' && schedule.s3 && schedule.s3.bucket) {
      await uploadS3(schedule.s3.bucket, schedule.s3.prefix || '', csv, schedule.name);
      details.s3 = { bucket: schedule.s3.bucket, key: `${schedule.s3.prefix || ''}${schedule.name || 'products'}.csv` };
    }
    runDoc.status = 'success';
    runDoc.finishedAt = new Date();
    runDoc.details = { ...runDoc.details, ...details };
    await runDoc.save();

    schedule.lastRunAt = new Date();
    await schedule.save();

  } catch (err) {
    console.error('❌ Error running scheduled export job:', err.message);
    runDoc.status = 'failed';
    runDoc.errorMessage = err.message;
    runDoc.finishedAt = new Date();
    await runDoc.save();

    // Schedule retry if enabled
    if (schedule.retry && schedule.retry.enabled) {
      const max = schedule.retry.maxAttempts || 3;
      if (attempt < max) {
        const backoff = (schedule.retry.backoffSeconds || 60) * 1000 * Math.pow(2, attempt - 1);
        console.log(`🔁 Scheduling retry #${attempt+1} in ${backoff}ms for schedule ${schedule._id}`);
        setTimeout(() => {
          // re-fetch schedule in case it changed
          ScheduledExport.findById(schedule._id).then(s => {
            if (s && s.enabled) runJob(s, { attempt: attempt + 1, retryOf: runDoc._id.toString() });
          });
        }, backoff);
      }
    }
  }
};

const registerJob = (schedule) => {
  try {
    const id = schedule._id.toString();
    if (jobs.has(id)) {
      // stop existing
      const existing = jobs.get(id);
      existing.task.stop();
      jobs.delete(id);
    }
    if (!schedule.enabled) return;
    const task = cron.schedule(schedule.cron, () => runJob(schedule), { scheduled: true });
    jobs.set(id, { task, schedule });
    console.log('✅ Registered scheduled export:', schedule.name, schedule.cron);
  } catch (err) {
    console.error('❌ Failed to register job:', err.message);
  }
};

const unregisterJob = (id) => {
  if (jobs.has(id)) {
    const j = jobs.get(id);
    j.task.stop();
    jobs.delete(id);
    console.log('🗑️ Unregistered scheduled export job', id);
  }
};

const refreshJob = (schedule) => { registerJob(schedule); };

const init = async () => {
  try {
    const list = await ScheduledExport.find({ enabled: true });
    list.forEach(schedule => registerJob(schedule));
    console.log('✅ Scheduled export runner initialized');
  } catch (err) {
    console.error('❌ Failed to initialize scheduled runner:', err.message);
  }
};

const runJobNow = async (schedule) => { await runJob(schedule); };

const retryRun = async (runId) => {
  const run = await ScheduledExportRun.findById(runId);
  if (!run) throw new Error('Run not found');
  if (run.status !== 'failed') throw new Error('Only failed runs can be retried');
  const schedule = await ScheduledExport.findById(run.schedule);
  if (!schedule) throw new Error('Schedule not found');
  // start a new run with attempt incremented
  await runJob(schedule, { attempt: (run.attempt || 1) + 1, retryOf: run._id.toString() });
  return true;
};

module.exports = { init, registerJob, unregisterJob, refreshJob, runJobNow, retryRun };
