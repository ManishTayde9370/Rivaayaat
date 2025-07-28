import React from 'react';

const ShippingDetails = () => (
  <div className="container py-5">
    <h1 className="mb-4 rivaayat-heading">Shipping Details</h1>
    <p>We deliver across India and internationally. Here are our standard shipping rates and timelines:</p>
    <table className="table table-bordered mb-4" style={{ maxWidth: 600, background: '#fff8f0', border: '1.5px solid var(--border-color)' }}>
      <thead>
        <tr>
          <th>Region</th>
          <th>Delivery Time</th>
          <th>Shipping Rate</th>
          <th>Courier</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Within India</td>
          <td>3-7 business days</td>
          <td>₹99 (Free over ₹2000)</td>
          <td>Delhivery, Bluedart</td>
        </tr>
        <tr>
          <td>International</td>
          <td>7-15 business days</td>
          <td>₹999</td>
          <td>DHL, FedEx</td>
        </tr>
      </tbody>
    </table>
    <p>All orders are processed within 1-2 business days. You will receive a tracking link by email once your order ships.</p>
  </div>
);

export default ShippingDetails; 