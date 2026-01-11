const mongoose = require('mongoose');

const scheduledExportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cron: { type: String, required: true }, // cron expression
  destination: {
    type: String,
    enum: ['email', 's3'],
    required: true
  },
  emails: [{ type: String }], // for email destination
  s3: {
    bucket: String,
    prefix: String
  },
  enabled: { type: Boolean, default: true },
  lastRunAt: { type: Date },
  // retry configuration
  retry: {
    enabled: { type: Boolean, default: false },
    maxAttempts: { type: Number, default: 3 },
    backoffSeconds: { type: Number, default: 60 }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const ScheduledExport = mongoose.model('ScheduledExport', scheduledExportSchema);
module.exports = ScheduledExport;