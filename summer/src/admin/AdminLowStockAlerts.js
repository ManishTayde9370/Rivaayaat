import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import { showNotification, adminNotifications } from '../utils/notifications';

const API = `${serverEndpoint}/api/admin/low-stock`;

const AdminLowStockAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, { withCredentials: true });
      setAlerts(res.data.alerts || []);
    } catch (err) {
      showNotification.error('Failed to load low-stock alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const ack = async (productId) => {
    setActing(productId);
    try {
      await axios.post(`${API}/ack/${productId}`, {}, { withCredentials: true });
      showNotification.success('Alert acknowledged');
      fetchAlerts();
    } catch (err) {
      showNotification.error('Failed to acknowledge alert');
    } finally {
      setActing(null);
    }
  };

  const resolve = async (productId) => {
    setActing(productId);
    try {
      await axios.delete(`${API}/resolve/${productId}`, { withCredentials: true });
      showNotification.info('Alert resolved');
      fetchAlerts();
    } catch (err) {
      showNotification.error('Failed to resolve alert');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="admin-card">
      <h2>Low Stock Alerts</h2>
      <div className="mb-3">
        <button className="btn btn-sm btn-secondary" onClick={fetchAlerts} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Threshold</th>
              <th>Acknowledged</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 && (
              <tr><td colSpan="6" className="text-center">No low-stock alerts</td></tr>
            )}
            {alerts.map((a) => (
              <tr key={a._id}>
                <td>{a.product?.name || a.product}</td>
                <td>{a.currentStock}</td>
                <td>{a.threshold}</td>
                <td>{a.acknowledged ? 'Yes' : 'No'}</td>
                <td>{new Date(a.createdAt).toLocaleString()}</td>
                <td>
                  {!a.acknowledged && (
                    <button className="btn btn-sm btn-primary me-2" onClick={() => ack(a.product._id)} disabled={acting && acting !== a.product._id}>
                      {acting === a.product._id ? 'Working...' : 'Acknowledge'}
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline-danger" onClick={() => resolve(a.product._id)} disabled={acting && acting !== a.product._id}>Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLowStockAlerts;
