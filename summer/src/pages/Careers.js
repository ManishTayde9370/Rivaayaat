import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const positions = [
  { title: 'Frontend Developer', location: 'Remote', type: 'Full-time' },
  { title: 'Content Writer', location: 'Mumbai', type: 'Part-time' },
  { title: 'Customer Support', location: 'Remote', type: 'Full-time' },
];

const Careers = () => {
  const userDetails = useSelector(state => state.user);
  const [form, setForm] = useState({
    name: userDetails?.name || '',
    email: userDetails?.email || '',
    position: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userDetails?._id) {
      axios.get(`/api/careers/applications?userId=${userDetails._id}`)
        .then(res => setApplications(res.data.applications || []))
        .catch(() => setApplications([]));
    }
  }, [userDetails]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/careers/apply', { ...form, userId: userDetails?._id });
      setSubmitted(true);
      setForm({ name: userDetails?.name || '', email: userDetails?.email || '', position: '', message: '' });
      // Refresh applications
      if (userDetails?._id) {
        const res = await axios.get(`/api/careers/applications?userId=${userDetails._id}`);
        setApplications(res.data.applications || []);
      }
    } catch {
      // handle error
    }
    setLoading(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4 Rivaayaat-heading">Careers</h1>
      <h4 className="Rivaayaat-heading" style={{ fontSize: '1.3em' }}>Open Positions</h4>
      <ul className="list-group mb-4">
        {positions.map((pos, i) => (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={i} style={{ borderRadius: 8, background: '#fff8f0', border: '1.5px solid var(--border-color)', marginBottom: 8 }}>
            <span><strong>{pos.title}</strong> <span className="text-muted">({pos.location}, {pos.type})</span></span>
            <span className="badge" style={{ background: 'var(--accent-color)', color: '#fff', borderRadius: 6 }}>Apply</span>
          </li>
        ))}
      </ul>
      <h4 className="Rivaayaat-heading" style={{ fontSize: '1.3em' }}>Your Applications</h4>
      <ul className="list-group mb-4" style={{ maxWidth: 500 }}>
        {applications.length === 0 ? <li className="list-group-item">No applications yet.</li> : applications.map((app, i) => (
          <li className="list-group-item" key={i}>
            <strong>{app.position}</strong> - {app.status || 'Submitted'}<br />
            <span className="text-muted small">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}</span>
          </li>
        ))}
      </ul>
      <h4 className="Rivaayaat-heading mt-4" style={{ fontSize: '1.3em' }}>Apply Now</h4>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, background: '#fff8f0', borderRadius: 12, border: '1.5px solid var(--border-color)', padding: 24 }}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control" id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" className="form-control" id="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="position" className="form-label">Position</label>
          <select className="form-select" id="position" name="position" value={form.position} onChange={handleChange} required>
            <option value="">Select a position</option>
            {positions.map((pos, i) => (
              <option key={i} value={pos.title}>{pos.title}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="message" className="form-label">Why do you want to join us?</label>
          <textarea className="form-control" id="message" name="message" rows={3} value={form.message} onChange={handleChange} required />
        </div>
        <button type="submit" className="Rivaayaat-btn" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</button>
        {submitted && <div className="alert alert-success mt-3">Thank you for applying! We'll be in touch soon.</div>}
      </form>
    </div>
  );
};

export default Careers; 