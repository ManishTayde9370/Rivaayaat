import React from 'react';

const TermsOfUse = () => (
  <div className="container py-5">
    <h1 className="mb-4 rivaayat-heading">Terms of Use</h1>
    <ol style={{ maxWidth: 700, background: '#fff8f0', borderRadius: 12, border: '1.5px solid var(--border-color)', padding: 24 }}>
      <li><strong>Acceptance:</strong> By using this website, you agree to our terms and policies.</li>
      <li><strong>Use of Content:</strong> All content is for personal, non-commercial use. Do not copy or redistribute without permission.</li>
      <li><strong>Account:</strong> You are responsible for maintaining the confidentiality of your account and password.</li>
      <li><strong>Orders:</strong> We reserve the right to refuse or cancel orders at our discretion.</li>
      <li><strong>Changes:</strong> We may update these terms at any time. Continued use of the site means you accept the changes.</li>
    </ol>
    <p>For questions, contact us at care@rivaayaat.com.</p>
  </div>
);

export default TermsOfUse; 