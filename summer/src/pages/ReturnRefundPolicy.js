import React from 'react';

const ReturnRefundPolicy = () => (
  <div className="container py-5">
    <h1 className="mb-4 Rivaayaat-heading">Return & Refund Policy</h1>
    <ol style={{ maxWidth: 700, background: '#fff8f0', borderRadius: 12, border: '1.5px solid var(--border-color)', padding: 24 }}>
      <li><strong>Eligibility:</strong> Returns are accepted within 7 days of delivery for unused, unworn items with original tags and packaging.</li>
      <li><strong>Initiate Return:</strong> Email care@Rivaayat.com or use the Track Order page to request a return. Provide your order ID and reason.</li>
      <li><strong>Pickup/Shipping:</strong> We will arrange a pickup or provide a return shipping address. Pack the item securely.</li>
      <li><strong>Inspection:</strong> Once received, we inspect the item. If approved, your refund is processed within 5-7 business days.</li>
      <li><strong>Refund Method:</strong> Refunds are issued to your original payment method.</li>
    </ol>
    <p>For any questions, contact our support team at care@Rivaayat.com.</p>
  </div>
);

export default ReturnRefundPolicy; 