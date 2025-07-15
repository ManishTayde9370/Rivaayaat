const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const sendOrderConfirmationEmail = async (userEmail, order) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Generate PDF invoice in memory
  const doc = new PDFDocument({ margin: 40 });
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  const logoPath = path.join(__dirname, '../../src/assets/brandlogo.png');

  // Header
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 40, { width: 60 });
  }
  doc.fontSize(22).text('Rivaayaat', 110, 40, { continued: true }).fontSize(12).text('  www.rivaayaat.com');
  doc.moveDown();
  doc.fontSize(16).text('Order Invoice', { underline: true });
  doc.moveDown();

  // Order details
  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Order Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}`);
  doc.text(`Total Paid: ₹${order.amountPaid.toLocaleString('en-IN')}`);
  doc.moveDown();

  // Shipping address
  doc.fontSize(14).text('Shipping Address:', { underline: true });
  doc.fontSize(12).text(`${order.shippingAddress.address}, ${order.shippingAddress.city}`);
  doc.text(`${order.shippingAddress.state || ''} - ${order.shippingAddress.postalCode}, ${order.shippingAddress.country || ''}`);
  if (order.shippingAddress.email) doc.text(`Email: ${order.shippingAddress.email}`);
  if (order.shippingAddress.mobile) doc.text(`Mobile: ${order.shippingAddress.mobile}`);
  doc.moveDown();

  // Items table
  doc.fontSize(14).text('Items:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text('Product', 40, doc.y, { continued: true });
  doc.text('Qty', 200, doc.y, { continued: true });
  doc.text('Price', 250, doc.y, { continued: true });
  doc.text('Total', 320, doc.y);
  doc.moveDown(0.5);
  order.items.forEach((item) => {
    doc.text(item.name, 40, doc.y, { continued: true });
    doc.text(String(item.quantity), 200, doc.y, { continued: true });
    doc.text(`₹${item.price}`, 250, doc.y, { continued: true });
    doc.text(`₹${item.price * item.quantity}`, 320, doc.y);
  });
  doc.moveDown();
  doc.fontSize(14).text(`Grand Total: ₹${order.amountPaid.toLocaleString('en-IN')}`, { align: 'right' });

  doc.end();
  const pdfBuffer = await new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });

  const productList = order.items.map(
    (p) => `<li>${p.name} × ${p.quantity} = ₹${(p.price * p.quantity).toLocaleString('en-IN')}</li>`
  ).join('');

  const mailOptions = {
    from: `"Shop" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: '🛒 Order Invoice',
    html: `
      <h2>Thank you for your order!</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Total Paid:</strong> ₹${order.amountPaid.toLocaleString('en-IN')}</p>
      <p><strong>Order Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</p>
      <p><strong>Shipping Address:</strong><br>
      ${order.shippingAddress.address}, ${order.shippingAddress.city}<br>
      ${order.shippingAddress.state || ''} - ${order.shippingAddress.postalCode}, ${order.shippingAddress.country || ''}</p>
      ${order.shippingAddress.mobile ? `<p><strong>Mobile:</strong> ${order.shippingAddress.mobile}</p>` : ''}
      <h4>Items:</h4>
      <ul>${productList}</ul>
      <p><strong>Grand Total:</strong> ₹${order.amountPaid.toLocaleString('en-IN')}</p>
      <p>Your PDF invoice is attached to this email.</p>
    `,
    attachments: [
      {
        filename: `Invoice_${order._id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOrderConfirmationEmail;
