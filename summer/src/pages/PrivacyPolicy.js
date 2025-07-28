import React from 'react';

const PrivacyPolicy = () => (
  <div className="container py-5">
    <h1 className="mb-4 rivaayat-heading">Privacy Policy</h1>
    <ol style={{ maxWidth: 700, background: '#fff8f0', borderRadius: 12, border: '1.5px solid var(--border-color)', padding: 24 }}>
      <li><strong>Information Collection:</strong> We collect your name, email, and order details to process orders and improve our services.</li>
      <li><strong>Use of Data:</strong> Your data is used only for order fulfillment, support, and marketing (with your consent).</li>
      <li><strong>Security:</strong> We use industry-standard security measures to protect your data.</li>
      <li><strong>Sharing:</strong> We do not sell or share your data with third parties except for order processing (e.g., couriers).</li>
      <li><strong>Contact:</strong> For privacy questions, email care@rivaayaat.com.</li>
    </ol>
    <p>By using our site, you consent to this policy. We may update it from time to time.</p>
  </div>
);

export default PrivacyPolicy; 