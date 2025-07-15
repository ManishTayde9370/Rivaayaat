import React from 'react';
import '../css/Splashscreen.css';
import logo from '../assets/brandlogo.png'; // Update path as per your folder structure

const SplashScreen = () => {
  return (
    <div className="splash-screen d-flex justify-content-center align-items-center vh-100">
      <div className="text-center fade-in">
        <img src={logo} alt="Rivaayat Logo" className="brand-logo mb-4" />
        <h1 className="display-5">✨ Welcome to Rivaayat ✨</h1>
        <p className="lead">Rooted in tradition. Designed for today.</p>
      </div>
    </div>
  );
};

export default SplashScreen;
