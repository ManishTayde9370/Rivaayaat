import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../components/config';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${serverEndpoint}/api/checkout/orders`, { withCredentials: true });
        setOrders(res.data.orders || []);
      } catch (_) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="container py-5">Loading...</div>;

  return (
    <div className="container py-5">
      <h1 className="rivaayat-heading mb-4">My Orders</h1>
      {orders.length === 0 ? (
        <div className="alert alert-info">No orders yet.</div>
      ) : (
        <div className="rivaayat-card p-3">
          {orders.map(o => (
            <div key={o._id} className="d-flex justify-content-between align-items-center border-bottom py-2">
              <div>
                <div className="fw-bold">Order #{o._id.slice(-6)}</div>
                <small className="text-muted">{new Date(o.createdAt).toLocaleString()}</small>
              </div>
              <div>
                <div className="badge bg-secondary me-3">{o.status}</div>
                <strong>₹{o.amountPaid}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
