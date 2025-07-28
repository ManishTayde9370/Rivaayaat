import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSignOutAlt, FaBoxOpen, FaHeart } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import { SET_USER } from '../redux/user/actions';
import { fetchWishlist } from '../redux/wishlist/actions';
import LoadingBar from '../components/LoadingBar';
import WishlistItem from '../components/WishlistItem';

const Dashboard = ({ onLogout }) => {
  const userDetails = useSelector(state => state.user);
  const wishlist = useSelector(state => state.wishlist.items) || [];
  const wishlistLoading = useSelector(state => state.wishlist.loading);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [profile, setProfile] = useState({
    name: userDetails?.name || '',
    email: userDetails?.email || '',
    phone: userDetails?.phone || ''
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userDetails?._id) return;
    
    // Fetch orders
    setOrdersLoading(true);
    axios.get(`/api/orders?userId=${userDetails._id}`)
      .then(res => setOrders(res.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
    
    // Fetch wishlist
    dispatch(fetchWishlist());
  }, [userDetails, dispatch]);

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });
  
  const handleEdit = async e => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileError(null);
    try {
      const res = await axios.patch('/api/auth/me', profile, { withCredentials: true });
      setProfileMsg(res.data.message || 'Profile updated');
      setEdit(false);
      if (res.data.user) {
        setProfile(res.data.user);
        dispatch({ type: SET_USER, payload: { ...userDetails, ...res.data.user } });
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleShowOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };
  
  const handleCloseOrder = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="rivaayat-heading mb-0">My Account</h1>
        {onLogout && (
          <button className="rivaayat-btn d-flex align-items-center" onClick={onLogout} style={{ minWidth: 110 }} aria-label="Logout">
            <FaSignOutAlt className="me-2" /> Logout
          </button>
        )}
      </div>
      
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="rivaayat-card h-100">
            <div className="d-flex align-items-center mb-3">
              <FaUser size={28} style={{ color: 'var(--accent-color)', marginRight: 10 }} />
              <h5 className="mb-0" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Profile</h5>
            </div>
            {edit ? (
              <form onSubmit={handleEdit}>
                <div className="mb-2">
                  <label>Name</label>
                  <input className="form-control" name="name" value={profile.name} onChange={handleChange} />
                </div>
                <div className="mb-2">
                  <label>Email</label>
                  <input className="form-control" name="email" value={profile.email} onChange={handleChange} />
                </div>
                <div className="mb-2">
                  <label>Phone</label>
                  <input className="form-control" name="phone" value={profile.phone} onChange={handleChange} />
                </div>
                <button className="rivaayat-btn btn-sm mt-2" type="submit" aria-label="Save Profile" tabIndex={0}>Save</button>
                {profileMsg && <div className="alert alert-success mt-2">{profileMsg}</div>}
                {profileError && <div className="alert alert-danger mt-2">{profileError}</div>}
              </form>
            ) : (
              <>
                <p className="mb-2"><FaUser className="me-2" /> <strong>Name:</strong> {profile.name || 'N/A'}</p>
                <p className="mb-2"><FaEnvelope className="me-2" /> <strong>Email:</strong> {profile.email || 'N/A'}</p>
                <p className="mb-2"><FaPhone className="me-2" /> <strong>Phone:</strong> {profile.phone || 'N/A'}</p>
                <button className="rivaayat-btn btn-sm mt-2" style={{ background: 'var(--secondary-color)', color: 'var(--primary-color)' }} onClick={() => setEdit(true)} aria-label="Edit Profile" tabIndex={0}><FaEdit className="me-1" /> Edit</button>
                {profileMsg && <div className="alert alert-success mt-2">{profileMsg}</div>}
                {profileError && <div className="alert alert-danger mt-2">{profileError}</div>}
              </>
            )}
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="rivaayat-card h-100">
            <div className="d-flex align-items-center mb-3">
              <FaBoxOpen size={26} style={{ color: 'var(--accent-color)', marginRight: 10 }} />
              <h5 className="mb-0" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Account Settings</h5>
            </div>
            <p>Update your password, address, and preferences here. <span className="text-muted">(Feature coming soon!)</span></p>
          </div>
        </div>
      </div>
      
      <div className="row g-4 mb-4">
        <div className="col-md-7">
          <div className="rivaayat-card h-100">
            <div className="d-flex align-items-center mb-3">
              <FaBoxOpen size={24} style={{ color: 'var(--accent-color)', marginRight: 10 }} />
              <h5 className="mb-0" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Order History</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersLoading ? (
                    <tr><td colSpan={5} className="text-center"><LoadingBar /></td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={5} className="text-center">No orders found.</td></tr>
                  ) : orders.map(o => (
                    <tr key={o._id || o.id}>
                      <td>{o._id || o.id}</td>
                      <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : o.date}</td>
                      <td><span className="badge bg-success" style={{ fontSize: '1em' }}>{o.status || o.orderStatus}</span></td>
                      <td>₹{o.amountPaid || o.amount}</td>
                      <td>
                        <button className="btn btn-outline-primary btn-sm" onClick={() => handleShowOrder(o)} aria-label="View Order Details">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="col-md-5">
          <div className="rivaayat-card h-100">
            <div className="d-flex align-items-center mb-3">
              <FaHeart size={22} style={{ color: 'var(--accent-color)', marginRight: 10 }} />
              <h5 className="mb-0" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Wishlist</h5>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {wishlistLoading ? (
                <div className="text-center py-3">
                  <LoadingBar />
                </div>
              ) : wishlist.length === 0 ? (
                <p className="text-muted text-center py-3">No items in wishlist.</p>
              ) : (
                wishlist.map((item, i) => (
                  <WishlistItem key={item._id || i} item={item} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={handleCloseOrder} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <p><strong>Order ID:</strong> {selectedOrder._id || selectedOrder.id}</p>
              <p><strong>Date:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : selectedOrder.date}</p>
              <p><strong>Status:</strong> {selectedOrder.status || selectedOrder.orderStatus}</p>
              <p><strong>Amount:</strong> ₹{selectedOrder.amountPaid || selectedOrder.amount}</p>
              {selectedOrder.items && (
                <div>
                  <h6>Items:</h6>
                  <ul>
                    {selectedOrder.items.map((item, index) => (
                      <li key={index}>
                        {item.name} - Qty: {item.quantity} - ₹{item.price}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseOrder}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
