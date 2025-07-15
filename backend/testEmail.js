const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: `"Test" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER, // send to yourself
  subject: 'Test Email from Rivaayaat Backend',
  text: 'This is a test email to verify your SMTP credentials and network.',
}, (err, info) => {
  if (err) {
    return console.error('Error:', err);
  }
  console.log('Email sent:', info.response);
}); 