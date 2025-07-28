import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setShippingAddress } from '../redux/shipping/actions';
import { useNavigate } from 'react-router-dom';

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
      <h2 className="mb-4">Shipping Address</h2>
      {formError && <div className="alert alert-danger">{formError}</div>}
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3" style={{ maxWidth: '400px' }}>
        <div>
          <label htmlFor="address">Address</label>
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
          <label htmlFor="city">City</label>
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
          <label htmlFor="postalCode">Postal Code</label>
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
          <label htmlFor="email">Email</label>
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
          <label htmlFor="mobile">Mobile Number</label>
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

        <button type="submit" className="btn btn-primary w-100">
          Continue to Payment
        </button>
      </form>
    </div>
  );
};

export default CheckoutShipping;
