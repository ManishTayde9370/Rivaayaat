// src/pages/AdminLogin.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { SET_USER } from '../redux/user/actions';

import { 
  FaUserAlt, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaCrown,
  FaShieldAlt,
  FaArrowRight
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/royal-login.css';
import { authNotifications } from '../utils/notifications';

const AdminLogin = () => {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validate = () => {
    const err = {};
    if (!identity.trim()) err.identity = 'Username or email is required';
    if (!password) err.password = 'Password is required';
    if (password.length < 6) err.password = 'Password must be at least 6 characters';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setLoading(true);
    try {
      // First, attempt login
      const loginResponse = await axios.post(
        'http://localhost:5000/api/auth/login',
        { identity: identity.trim(), password },
        { withCredentials: true }
      );

      if (!loginResponse.data.success) {
        throw new Error(loginResponse.data.message || 'Login failed');
      }

      // Then verify user details and admin status
      const userRes = await axios.get(
        'http://localhost:5000/api/auth/is-user-logged-in',
        { withCredentials: true }
      );

      if (!userRes.data.success) {
        throw new Error('Failed to verify user session');
      }

      const user = userRes.data.userDetails;

      if (!user) {
        throw new Error('User session not found');
      }

      // Check if user is blocked
      if (user.isBlocked) {
        throw new Error('Account has been blocked. Please contact support.');
      }

      // Verify admin privileges
      if (!user.isAdmin) {
        // Clear any existing session
        await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
        throw new Error('Access denied. Admin privileges required.');
      }

      // Set user in Redux store
      dispatch({ type: SET_USER, payload: user });
      authNotifications.loginSuccess();
      
      // Navigate to admin dashboard
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 1000);
    } catch (err) {
      console.error('Admin login error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        authNotifications.loginFailed('Invalid credentials');
      } else if (err.response?.status === 403) {
        authNotifications.loginFailed(err.response.data.message || 'Access denied');
      } else if (err.response?.status === 429) {
        authNotifications.loginFailed('Too many login attempts. Please try again later.');
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Login failed';
        authNotifications.loginFailed(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  return (
    <div className="admin-login-container">
      <ToastContainer />
      
      {/* Background Pattern */}
      <div className="login-background">
        <div className="pattern-overlay"></div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <div className="login-header">
          <div className="brand-section">
            <div className="brand-icon">
              <FaCrown />
            </div>
            <h1 className="brand-title">Rivaayat</h1>
            <p className="brand-subtitle">Admin Portal</p>
          </div>
        </div>

        <div className="login-content">
          <div className="welcome-section">
            <h2 className="welcome-title">
              <FaShieldAlt className="welcome-icon" />
              Admin Access
            </h2>
            <p className="welcome-text">
              Sign in to manage your e-commerce platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Username/Email Field */}
            <div className="form-group">
              <label className="form-label">
                <FaUserAlt className="label-icon" />
                Username or Email
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="identity"
                  placeholder="Enter your username or email"
                  className={`form-input ${errors.identity ? 'error' : ''}`}
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  autoComplete="username"
                />
                {errors.identity && (
                  <div className="error-message">{errors.identity}</div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                <FaLock className="label-icon" />
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <FaArrowRight className="button-icon" />
              )}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="security-notice">
            <FaShieldAlt className="security-icon" />
            <p>Secure admin access with enhanced authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;