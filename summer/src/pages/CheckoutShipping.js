import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setShippingAddress } from '../redux/shipping/actions';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import '../css/theme.css';
import '../css/CheckoutFlow.css';

const CheckoutShipping = () => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [formError, setFormError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!address.trim() || !city.trim() || !postalCode.trim() || !email.trim() || !mobile.trim()) {
      setFormError('Please fill out all fields');
      return;
    }

    // ✅ Add email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    // ✅ Add mobile number validation (basic Indian format)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile.replace(/\s/g, ''))) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    // ✅ Include all fields expected by backend
    dispatch(setShippingAddress({
      address,
      city,
      postalCode,
      state: 'Maharashtra',  // Hardcoded for now; can be made dynamic
      country: 'India',
      email,
      mobile,
    }));

    navigate('/checkout/payment');
  };

  return (
    <div className="checkout-container">
      <div className="container">
        <div className="checkout-header">
          <h1 className="cinzel" style={{ color: 'var(--color-earth)' }}>
            Shipping Address
          </h1>
          <p style={{ color: 'var(--color-earth)' }}>
            Please provide your delivery details
          </p>
        </div>

        <div className="checkout-form-container">
          <h2 className="cinzel mb-4 text-center" style={{ color: 'var(--color-earth)' }}>
            <FaMapMarkerAlt className="me-2" />
            Delivery Information
          </h2>
          
          {formError && (
            <div className="checkout-error">
              <FaExclamationTriangle />
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="checkout-form-group">
              <label htmlFor="address" className="checkout-form-label">Address</label>
              <input
                id="address"
                type="text"
                className="checkout-form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street"
                required
              />
            </div>
            <div className="checkout-form-group">
              <label htmlFor="city" className="checkout-form-label">City</label>
              <input
                id="city"
                type="text"
                className="checkout-form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                required
              />
            </div>
            <div className="checkout-form-group">
              <label htmlFor="postalCode" className="checkout-form-label">Postal Code</label>
              <input
                id="postalCode"
                type="text"
                className="checkout-form-input"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="400001"
                required
              />
            </div>
            <div className="checkout-form-group">
              <label htmlFor="email" className="checkout-form-label">Email</label>
              <input
                id="email"
                type="email"
                className="checkout-form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="checkout-form-group">
              <label htmlFor="mobile" className="checkout-form-label">Mobile Number</label>
              <input
                id="mobile"
                type="tel"
                className="checkout-form-input"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210"
                required
              />
            </div>
            <button type="submit" className="checkout-btn">
              Continue to Payment
              <FaArrowRight />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutShipping;
