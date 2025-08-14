import React, { useState } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import { ToastContainer } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserTag } from 'react-icons/fa';

import '../css/theme.css';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { authNotifications } from '../utils/notifications';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${serverEndpoint}/api/auth/register`, formData, {
        withCredentials: true
      });

      if (res.data.success) {
        authNotifications.registerSuccess();
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed.";
      authNotifications.registerFailed(msg);
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay"></div>
      <ToastContainer />

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="Rivaayaat-card login-card"
      >
        
        <h2 className="Rivaayaat-heading text-amber">Register</h2>
        <p className="Rivaayaat-subheading text-earth">Create your account</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 input-group">
            <span className="input-group-text Rivaayaat-input-icon">
              <FaUser />
            </span>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="Rivaayaat-input form-control"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text Rivaayaat-input-icon">
              <FaUserTag />
            </span>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="Rivaayaat-input form-control"
              required
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text Rivaayaat-input-icon">
              <FaEnvelope />
            </span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="Rivaayaat-input form-control"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text Rivaayaat-input-icon">
              <FaPhone />
            </span>
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              className="Rivaayaat-input form-control"
              required
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4 input-group">
            <span className="input-group-text Rivaayaat-input-icon">
              <FaLock />
            </span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="Rivaayaat-input form-control"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="Rivaayaat-btn w-100">Register</button>

          <div className="mt-3 text-center">
            <span className="text-black">Already have an account? </span>
            <Link to="/login" className="Rivaayaat-link">Login</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;