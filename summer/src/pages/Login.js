// src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {  ToastContainer } from 'react-toastify';

import { FaUserAlt, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import '../css/login.css';

import bgImage from '../assets/bg-login2.jpeg';
import SplashScreen from '../components/SplashScreen';
import { serverEndpoint } from '../components/config';
import { SET_USER } from '../redux/user/actions';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showSplash, setShowSplash] = useState(false);

  const validate = () => {
    const err = {};
    if (!identity) err.identity = 'Identity is required';
    if (!password) err.password = 'Password is required';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);
    setMessage('');

    if (Object.keys(formErrors).length === 0) {
      try {
        const response = await axios.post(
          `${serverEndpoint}/api/auth/login`,
          { identity, password },
          { withCredentials: true }
        );

        if (response.data.success) {
          setShowSplash(true);
          setTimeout(async () => {
            try {
              const userRes = await axios.get(
                `${serverEndpoint}/api/auth/is-user-logged-in`,
                { withCredentials: true }
              );

              const user = userRes.data.userDetails;
              dispatch({ type: SET_USER, payload: user });
              setShowSplash(false);
              navigate('/dashboard'); // ✅ Always go to dashboard (no admin condition)
            } catch (err) {
              console.error('User check error:', err);
              setShowSplash(false);
              setMessage('Could not fetch user info.');
            }
          }, 1500);
        } else {
          setMessage(response.data.message || 'Login failed.');
        }
      } catch (err) {
        console.error('Login error:', err);
        setMessage(err.response?.data?.message || 'Server error. Try again.');
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const googleCredential = credentialResponse.credential;
    setShowSplash(true);

    try {
      const res = await fetch(`${serverEndpoint}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: googleCredential }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const userRes = await axios.get(
          `${serverEndpoint}/api/auth/is-user-logged-in`,
          { withCredentials: true }
        );
        const user = userRes.data.userDetails;
        dispatch({ type: SET_USER, payload: user });
        navigate('/dashboard'); // ✅ Always to user dashboard
      } else {
        setMessage(data.message || 'Google login failed.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setMessage('Google login failed. Please try again.');
    } finally {
      setShowSplash(false);
    }
  };

  const handleGoogleFailure = () => {
    setMessage('Google authentication failed. Please try again.');
  };

  if (showSplash) return <SplashScreen />;

  return (
    <div className="login-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="login-overlay"></div>
      <ToastContainer />

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="login-card"
      >
        <h2 className="login-heading">Login</h2>
        <p className="login-subheading">Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 input-group">
            <span className="input-group-text"><FaUserAlt /></span>
            <input
              type="text"
              name="identity"
              placeholder="Username / Email / Phone"
              className={`form-control ${errors.identity ? 'is-invalid' : ''}`}
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
            />
          </div>
          {errors.identity && <div className="text-danger small mb-2">{errors.identity}</div>}

          <div className="mb-3 input-group">
            <span className="input-group-text"><FaLock /></span>
            <input
              type={showPwd ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="input-group-text"
              onClick={() => setShowPwd(!showPwd)}
              style={{ cursor: 'pointer' }}
            >
              {showPwd ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.password && <div className="text-danger small mb-2">{errors.password}</div>}

          <button type="submit" className="btn login-btn w-100">Login</button>

          <div className="text-center my-3" style={{ color: '#fcecc5', fontWeight: 'bold', position: 'relative' }}>
            <hr style={{ borderColor: '#fcecc5' }} />
            <span style={{
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              padding: '0 10px',
              position: 'absolute',
              top: '-13px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}>or</span>
          </div>

          <div className="d-flex justify-content-center mb-2">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
          </div>

          <div className="mt-3 text-center">
            <span>Don't have an account? </span>
            <Link to="/register" className="register-link">Register</Link>
          </div>

          {message && <div className="alert alert-danger mt-3">{message}</div>}
        </form>
      </motion.div>
    </div>
  );
};

export default Login;