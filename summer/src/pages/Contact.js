import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Contact Us</h1>
      <div className="row">
        <div className="col-md-6 mb-4">
          <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input type="text" className="form-control" id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea className="form-control" id="message" name="message" rows={4} value={form.message} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-dark">Send Message</button>
            {submitted && <div className="alert alert-success mt-3">Thank you! We'll get back to you soon.</div>}
          </form>
        </div>
        <div className="col-md-6 mb-4">
          <h5>Our Address</h5>
          <p>123 Heritage Lane, Mumbai, India</p>
          <h5>Phone</h5>
          <p>+91 98765 43210</p>
          <h5>Email</h5>
          <p>care@rivaayaat.com</p>
          <h5>Find Us</h5>
          <div style={{ width: '100%', height: 200, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            [Map Placeholder]
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
