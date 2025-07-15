import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserTag } from 'react-icons/fa';

import '../css/login.css';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      const res = await axios.post('http://localhost:5000/api/auth/register', formData, {
        withCredentials: true
      });

      if (res.data.success) {
        toast.success(res.data.message || "Registration successful!");
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed.";
      toast.error(msg);
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
        className="login-card"
      >
        
        <h2 className="login-heading">Register</h2>
        <p className="login-subheading">Create your account</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 input-group">
            <span className="input-group-text"><FaUser /></span>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="form-control"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text"><FaUserTag /></span>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="form-control"
              required
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text"><FaEnvelope /></span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text"><FaPhone /></span>
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              className="form-control"
              required
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4 input-group">
            <span className="input-group-text"><FaLock /></span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn login-btn w-100">Register</button>

          <div className="mt-3 text-center">
            <span>Already have an account? </span>
            <Link to="/login" className="register-link">Login</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
