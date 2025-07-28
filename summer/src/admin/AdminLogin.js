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
    if (!identity) err.identity = 'Username or email is required';
    if (!password) err.password = 'Password is required';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setLoading(true);
    try {
      await axios.post(
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
        authNotifications.loginSuccess();
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 1000);
      } else {
        authNotifications.loginFailed('You are not authorized as admin');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      authNotifications.loginFailed(errorMessage);
    } finally {
      setLoading(false);
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
                  disabled={loading}
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
                  disabled={loading}
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
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaArrowRight className="button-icon" />
                </>
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="login-footer">
            <div className="security-info">
              <FaShieldAlt className="security-icon" />
              <span>Secure admin access</span>
            </div>
            <p className="help-text">
              Need help? Contact your system administrator
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="decorative-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
    </div>
  );
};

export default AdminLogin;