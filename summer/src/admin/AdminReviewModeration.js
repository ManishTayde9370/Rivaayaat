import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import { showNotification, adminNotifications } from '../utils/notifications';

const API = `${serverEndpoint}/api/admin/reviews`;

const AdminReviewModeration = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/pending`, { withCredentials: true });
      setPending(res.data.pending || []);
    } catch (err) {
      showNotification.error('Failed to load pending reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (productId, reviewId) => {
    setActing(reviewId);
    try {
      await axios.post(`${API}/approve/${productId}/${reviewId}`, {}, { withCredentials: true });
      showNotification.success('Review approved');
      adminNotifications.productUpdated();
      fetchPending();
    } catch (err) {
      showNotification.error('Failed to approve review');
    } finally {
      setActing(null);
    }
  };

  const reject = async (productId, reviewId) => {
    setActing(reviewId);
    try {
      await axios.delete(`${API}/reject/${productId}/${reviewId}`, { withCredentials: true });
      showNotification.info('Review rejected and removed');
      fetchPending();
    } catch (err) {
      showNotification.error('Failed to reject review');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="admin-card">
      <h2>Pending Reviews</h2>
      <div className="mb-3">
        <button className="btn btn-sm btn-secondary" onClick={fetchPending} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Product</th>
              <th>User</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 && (
              <tr><td colSpan="6" className="text-center">No pending reviews</td></tr>
            )}
            {pending.map((p) => (
              <tr key={`${p.productId}-${p.review._id}`}>
                <td>{p.productName}</td>
                <td>{p.review.username}</td>
                <td>{p.review.rating}</td>
                <td style={{ maxWidth: 400 }}>{p.review.comment}</td>
                <td>{new Date(p.review.createdAt).toLocaleString()}</td>
                <td>
                  <button className="btn btn-sm btn-primary me-2" onClick={() => approve(p.productId, p.review._id)} disabled={acting && acting !== p.review._id}>
                    {acting === p.review._id ? 'Approving...' : 'Approve'}
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => reject(p.productId, p.review._id)} disabled={acting && acting !== p.review._id}>
                    {acting === p.review._id ? 'Rejecting...' : 'Reject'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviewModeration;
