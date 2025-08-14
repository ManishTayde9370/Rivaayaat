import React, { useState } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import { toast } from 'react-toastify';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${serverEndpoint}/api/contact`, form);
      
      if (response.data.success) {
        setSubmitted(true);
        setForm({ name: '', email: '', message: '' });
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        toast.error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Contact Us</h1>
      <div className="row">
        <div className="col-md-6 mb-4">
          <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input 
                type="text" 
                className="form-control" 
                id="name" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                id="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea 
                className="form-control" 
                id="message" 
                name="message" 
                rows={4} 
                value={form.message} 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-secondary" 
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
            {submitted && <div className="alert alert-success mt-3">Thank you! We'll get back to you soon.</div>}
          </form>
        </div>
        <div className="col-md-6 mb-4">
          <h5>Our Address</h5>
          <p>123 Heritage Lane, Mumbai, India</p>
          <h5>Phone</h5>
          <p>+91 98765 43210</p>
          <h5>Email</h5>
          <p>care@Rivaayat.com</p>
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
