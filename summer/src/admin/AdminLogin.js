// src/pages/AdminLogin.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { SET_USER } from '../redux/user/actions';

import { FaUserAlt, FaLock } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/royal-login.css';

const AdminLogin = () => {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validate = () => {
    const err = {};
    if (!identity) err.identity = 'Username or email is required';
    if (!password) err.password = 'Password is required';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        { identity, password },
        { withCredentials: true }
      );

      const userRes = await axios.get(
        'http://localhost:5000/api/auth/is-user-logged-in',
        { withCredentials: true }
      );

      const user = userRes.data.userDetails;

      if (user?.isAdmin) {
        dispatch({ type: SET_USER, payload: user });
        toast.success('Admin login successful');
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 1000);
      } else {
        toast.error('You are not authorized as admin');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="royal-bg d-flex align-items-center justify-content-center min-vh-100">
      <ToastContainer />
      <div className="royal-card p-4 rounded shadow-lg text-center">
        <h2 className="mb-3 royal-title">🔐 Admin Login</h2>
        <p className="text-white mb-4">Sign in to manage the Rivaayat platform</p>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-3 input-group">
            <span className="input-group-text"><FaUserAlt /></span>
            <input
              type="text"
              name="identity"
              placeholder="Username / Email"
              className={`form-control ${errors.identity ? 'is-invalid' : ''}`}
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
            />
          </div>
          {errors.identity && <div className="text-danger small mb-2">{errors.identity}</div>}

          {/* Password */}
          <div className="mb-3 input-group">
            <span className="input-group-text"><FaLock /></span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errors.password && <div className="text-danger small mb-3">{errors.password}</div>}

          <button type="submit" className="btn btn-dark w-100 fw-bold shadow">
            👑 Login as Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;