import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setShippingAddress } from '../redux/shipping/actions';
import { useNavigate } from 'react-router-dom';
import '../css/theme.css';

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
    <div className="container py-5">
      <h2 className="cinzel mb-4 text-center" style={{ color: 'var(--color-maroon)' }}>
        <span role="img" aria-label="scroll">📜</span> Shipping Address
      </h2>
      {formError && <div className="alert alert-danger">{formError}</div>}
      <div className="scroll-dropdown mx-auto p-4" style={{ maxWidth: 420 }}>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <label htmlFor="address" className="cinzel" style={{ color: 'var(--color-gold)' }}>Address</label>
            <input
              id="address"
              type="text"
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St"
              required
            />
          </div>
          <div>
            <label htmlFor="city" className="cinzel" style={{ color: 'var(--color-gold)' }}>City</label>
            <input
              id="city"
              type="text"
              className="form-control"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City Name"
              required
            />
          </div>
          <div>
            <label htmlFor="postalCode" className="cinzel" style={{ color: 'var(--color-gold)' }}>Postal Code</label>
            <input
              id="postalCode"
              type="text"
              className="form-control"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="400001"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="cinzel" style={{ color: 'var(--color-gold)' }}>Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="mobile" className="cinzel" style={{ color: 'var(--color-gold)' }}>Mobile Number</label>
            <input
              id="mobile"
              type="tel"
              className="form-control"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="9876543210"
              required
            />
          </div>
          <button type="submit" className="btn btn-dark w-100 scroll-dropdown" style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.1rem', color: 'var(--color-gold)', border: '2px solid var(--color-gold)' }}>
            <span role="img" aria-label="diya">🪔</span> Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutShipping;
