import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import bgImage from '../assets/bg-royal1.jpg'; // ✅ Correct import

const HomePublic = () => {
  return (
    <div
      className="text-light d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${bgImage})`, // ✅ Dynamic background from import
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      <div
        className="p-5 shadow-lg rounded"
        style={{
          maxWidth: '700px',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          border: '1px solid #fcecc5',
          borderRadius: '15px',
        }}
      >
        <h1 className="mb-4 text-center" style={{ fontFamily: 'Georgia', color: '#fcecc5' }}>
          Welcome to <span style={{ fontWeight: 'bold' }}>Rivaayat</span>
        </h1>

        <p className="lead text-center" style={{ color: '#f8f1d9' }}>
          Rivaayat celebrates India's rich heritage. Step into a world where timeless traditions
          meet modern elegance. Discover curated collections, cultural stories, and a royal community.
        </p>

        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="btn btn-outline-light px-4 py-2 mx-2"
            style={{ borderColor: '#fcecc5', color: '#fcecc5' }}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="btn btn-light px-4 py-2 mx-2"
            style={{ color: '#000', fontWeight: 'bold' }}
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePublic;
