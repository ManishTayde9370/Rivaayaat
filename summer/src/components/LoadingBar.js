import React from 'react';
import { Spinner } from 'react-bootstrap';
import './LoadingBar.css';

const LoadingBar = ({ 
  message = 'Loading...', 
  size = 'md', 
  variant = 'primary',
  fullScreen = false,
  overlay = false 
}) => {
  const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : undefined;
  
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-content">
          <Spinner 
            animation="border" 
            variant={variant} 
            size={spinnerSize}
            className="loading-spinner"
          />
          <p className="loading-message">{message}</p>
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <Spinner 
            animation="border" 
            variant={variant} 
            size={spinnerSize}
            className="loading-spinner"
          />
          <p className="loading-message">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <Spinner 
        animation="border" 
        variant={variant} 
        size={spinnerSize}
        className="loading-spinner"
      />
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingBar; 