import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import bgImage from '../assets/bg-royal.jpg';

const HomePrivate = () => {
  return (
    <div
      className="text-light d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      <div
        className="p-5 shadow-lg rounded text-center"
        style={{
          maxWidth: '750px',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          border: '1px solid #fcecc5',
          borderRadius: '20px',
        }}
      >
        <h1 className="mb-4" style={{ fontFamily: 'Georgia', fontWeight: 'bold', color: '#fcecc5' }}>
          Welcome Back to <span style={{ color: '#fff' }}>Rivaayat</span> 👋
        </h1>

        <p className="lead mb-4" style={{ color: '#f8f1d9' }}>
          Dive deeper into the world of heritage, culture, and curated excellence.
          You are now part of the tradition that bridges the past and present.
        </p>

        <div className="mb-4">
          <Link
            to="/dashboard"
            className="btn btn-outline-light px-4 py-2 mx-2"
            style={{ borderColor: '#fcecc5', color: '#fcecc5' }}
          >
            Go to Dashboard
          </Link>
          <Link
            to="/about"
            className="btn btn-light px-4 py-2 mx-2"
            style={{ color: '#000', fontWeight: 'bold' }}
          >
            Learn More
          </Link>
        </div>

        <hr style={{ borderTop: '1px solid #fcecc5' }} />
      </div>
    </div>
  );
};

export default HomePrivate;
