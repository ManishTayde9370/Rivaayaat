const nodemailer = require('nodemailer');

const sendStockNotificationEmail = async (toEmail, product) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  if (!emailUser || !emailPass) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not configured. Skipping stock notification email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass }
  });

  try {
    await transporter.verify();
  } catch (err) {
    console.warn('⚠️ SMTP verification failed. Stock email may not send:', err.message);
  }

  const frontendBase = process.env.FRONTEND_URL || process.env.FRONTEND_BASE_URL || 'https://rivaayaat.netlify.app';
  const productLink = `${frontendBase}/product/${product._id}`;

  const mailOptions = {
    from: `"Rivaayat" <${emailUser}>`,
    to: toEmail,
    subject: `🎉 ${product.name} is back in stock!`,
    html: `
      <h2>Good news!</h2>
      <p>The product <strong>${product.name}</strong> you were watching is back in stock.</p>
      <p><a href="${productLink}">Click here to view and purchase</a></p>
      <p>Price: ₹${product.price}</p>
      <p>Thanks — Rivaayat</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Stock notification sent to', toEmail);
  } catch (err) {
    console.error('❌ Failed to send stock notification to', toEmail, err.message);
  }
};

module.exports = sendStockNotificationEmail;
