import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import LoadingBar from '../components/LoadingBar';

const TrackOrder = () => {
  const userDetails = useSelector(state => state.user);
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState(userDetails?.email || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [trackError, setTrackError] = useState(null);

  useEffect(() => {
    if (userDetails?._id) {
      setRecentLoading(true);
      axios.get(`/api/orders?userId=${userDetails._id}`)
        .then(res => setRecentOrders(res.data.orders || []))
        .catch(() => setRecentOrders([]))
        .finally(() => setRecentLoading(false));
    }
  }, [userDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setTrackError(null);
    try {
      const res = await axios.post('/api/orders/track', { orderId, email });
      setResult(res.data.order);
    } catch (err) {
      setTrackError('Order not found or tracking failed. Please check your details and try again.');
      setResult(null);
    }
    setLoading(false);
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4 rivaayat-heading">Track Order</h1>
      <form className="mb-4" onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div className="mb-3">
          <label htmlFor="orderId" className="form-label">Order ID</label>
          <input type="text" className="form-control" id="orderId" value={orderId} onChange={e => setOrderId(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" className="form-control" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="rivaayat-btn" disabled={loading}>{loading ? 'Tracking...' : 'Track Order'}</button>
      </form>
      {trackError && <div className="alert alert-danger" style={{ maxWidth: 400 }}>{trackError}</div>}
      {result && (
        <div className="alert alert-info" style={{ maxWidth: 400 }}>
          <strong>Status:</strong> {result.status || result.orderStatus || 'N/A'}<br />
          <strong>Expected Delivery:</strong> {result.expected || result.expectedDelivery || '-'}<br />
          <strong>Items:</strong> {result.items?.length || result.items || '-'}<br />
          <strong>Shipping Address:</strong> {result.address || (result.shippingAddress && result.shippingAddress.address) || '-'}
        </div>
      )}
      <div className="mt-5" style={{ maxWidth: 500 }}>
        <h5>Recent Orders</h5>
        {recentLoading ? <div className="d-flex justify-content-center my-4"><LoadingBar /></div> : (
          <ul className="list-group">
            {recentOrders.length === 0 ? <li className="list-group-item">No recent orders found.</li> : recentOrders.map((o, i) => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={i}>
                <span>{o._id}</span>
                <span className="badge bg-secondary">{o.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TrackOrder; 