import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import { showNotification, adminNotifications } from '../utils/notifications';

const API = `${serverEndpoint}/api/stock-notify`;

const AdminStockNotifications = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(null);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, { withCredentials: true });
      setSubs(res.data.subscriptions || []);
    } catch (err) {
      showNotification.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubs(); }, []);

  const triggerSend = async (productId) => {
    setSending(productId);
    try {
      const res = await axios.post(`${API}/trigger/${productId}`, {}, { withCredentials: true });
      adminNotifications.productUpdated();
      showNotification.success(`Sent to ${res.data.sent} subscribers`);
      fetchSubs();
    } catch (err) {
      showNotification.error('Failed to send notifications');
    } finally {
      setSending(null);
    }
  };

  const removeSub = async (id) => {
    try {
      await axios.delete(`${API}/${id}`, { withCredentials: true });
      showNotification.info('Subscription removed');
      fetchSubs();
    } catch (err) {
      showNotification.error('Failed to remove subscription');
    }
  };

  return (
    <div className="admin-card">
      <h2>Stock Subscriptions</h2>
      <div className="mb-3">
        <button className="btn btn-sm btn-secondary" onClick={fetchSubs} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Product</th>
              <th>Email</th>
              <th>User</th>
              <th>Notified</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr><td colSpan="6" className="text-center">No subscriptions found</td></tr>
            )}
            {subs.map((s) => (
              <tr key={s._id}>
                <td>{s.product?.name || s.product}</td>
                <td>{s.email}</td>
                <td>{s.user?.email || '-'}</td>
                <td>{s.notified ? 'Yes' : 'No'}</td>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
                <td>
                  {!s.notified && (
                    <button className="btn btn-sm btn-primary me-2" onClick={() => triggerSend(s.product._id)} disabled={sending && sending !== s.product._id}>
                      {sending === s.product._id ? 'Sending...' : 'Send Now'}
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeSub(s._id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStockNotifications;
