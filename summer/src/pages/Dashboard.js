import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSignOutAlt, FaBoxOpen, FaHeart } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import { SET_USER } from '../redux/user/actions';
import { fetchWishlist } from '../redux/wishlist/actions';
import LoadingBar from '../components/LoadingBar';
import WishlistItem from '../components/WishlistItem';
import { authNotifications } from '../utils/notifications';

const Dashboard = ({ onLogout }) => {
  const userDetails = useSelector(state => state.user);
  // const wishlist = useSelector(state => state.wishlist.items) || [];
  const wishlist = useSelector(state => state.wishlist.items);
  const wishlistLoading = useSelector(state => state.wishlist.loading);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [edit, setEdit] = useState(false);
  const [profile, setProfile] = useState({
    name: userDetails?.name || '',
    email: userDetails?.email || '',
    phone: userDetails?.phone || ''
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const dispatch = useDispatch();

  // Memoize profile data to prevent unnecessary re-renders
  const profileData = useMemo(() => ({
    name: userDetails?.name || '',
    email: userDetails?.email || '',
    phone: userDetails?.phone || ''
  }), [userDetails?.name, userDetails?.email, userDetails?.phone]);

  // Update profile state when user details change
  useEffect(() => {
    if (!edit) { // Only update when not editing to prevent overwriting user input
      setProfile(profileData);
    }
  }, [profileData, edit]);

  // Fetch orders with improved error handling
  const fetchOrders = useCallback(async () => {
    if (!userDetails?._id || ordersLoading) return;
    
    setOrdersLoading(true);
    setOrdersError(null);
    
    try {
      const response = await axios.get(`${serverEndpoint}/api/checkout/orders`, { withCredentials: true });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrdersError(error.response?.data?.message || 'Failed to load orders');
      setOrders([]); // Set empty array to prevent undefined state
    } finally {
      setOrdersLoading(false);
    }
  }, [userDetails?._id, ordersLoading]);

  // Fetch wishlist with improved error handling
  const fetchWishlistData = useCallback(async () => {
    if (!userDetails?._id) return;
    
    try {
      await dispatch(fetchWishlist());
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  }, [userDetails?._id, dispatch]);

  // Initial data load - only once when component mounts
  useEffect(() => {
    if (!userDetails?._id || dataLoaded) return;
    
    const loadData = async () => {
      await Promise.all([
        fetchOrders(),
        fetchWishlistData()
      ]);
      setDataLoaded(true);
    };
    
    loadData();
  }, [userDetails?._id, dataLoaded, fetchOrders, fetchWishlistData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleEdit = useCallback(async (e) => {
    e.preventDefault();
    if (profileLoading) return;
    
    setProfileMsg(null);
    setProfileError(null);
    setProfileLoading(true);
    
    try {
      const response = await axios.patch('/api/auth/me', profile, { withCredentials: true });
      
      if (response.data.success) {
        setProfileMsg(response.data.message || 'Profile updated successfully');
        setEdit(false);
        authNotifications.profileUpdated();
        
        if (response.data.user) {
          setProfile(response.data.user);
          dispatch({ type: SET_USER, payload: { ...userDetails, ...response.data.user } });
        }
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      setProfileError(errorMessage);
      authNotifications.profileError(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  }, [profile, profileLoading, userDetails, dispatch]);

  const handleShowOrder = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }, []);
  
  const handleCloseOrder = useCallback(() => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEdit(false);
    setProfile(profileData); // Reset to original data
    setProfileMsg(null);
    setProfileError(null);
  }, [profileData]);

  // Retry functions for error states
  const retryOrders = useCallback(() => {
    setOrdersError(null);
    fetchOrders();
  }, [fetchOrders]);

  // Memoized components to prevent unnecessary re-renders
  const ProfileSection = useMemo(() => (
    <div className="col-md-4">
      <div className="Rivaayaat-card h-100">
        <div className="d-flex align-items-center mb-3">
          <FaUser size={28} style={{ color: 'var(--accent-color)', marginRight: 10 }} />
          <h5 className="mb-0" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Profile</h5>
        </div>
        {edit ? (
          <form onSubmit={handleEdit}>
            <div className="mb-2">
              <label>Name</label>
              <input 
                className="form-control" 
                name="name" 
                value={profile.name} 
                onChange={handleChange}
                disabled={profileLoading}
                required
              />
            </div>
            <div className="mb-2">
              <label>Email</label>
              <input 
                className="form-control" 
                name="email" 
                type="email"
                value={profile.email} 
                onChange={handleChange}
                disabled={profileLoading}
                required
              />
            </div>
            <div className="mb-3">
              <label>Phone</label>
              <input 
                className="form-control" 
                name="phone" 
                value={profile.phone} 
                onChange={handleChange}
                disabled={profileLoading}
              />
            </div>
            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-success btn-sm"
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving...' : 'Save'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleCancelEdit}
                disabled={profileLoading}
              >
                Cancel
              </button>
            </div>
            {profileError && <div className="alert alert-danger mt-2 p-2">{profileError}</div>}
            {profileMsg && <div className="alert alert-success mt-2 p-2">{profileMsg}</div>}
          </form>
        ) : (
          <>
            <div className="mb-2 d-flex align-items-center">
              <FaUser className="me-2" style={{ color: 'var(--accent-color)' }} />
              <span>{userDetails?.name}</span>
            </div>
            <div className="mb-2 d-flex align-items-center">
              <FaEnvelope className="me-2" style={{ color: 'var(--accent-color)' }} />
              <span>{userDetails?.email}</span>
            </div>
            <div className="mb-3 d-flex align-items-center">
              <FaPhone className="me-2" style={{ color: 'var(--accent-color)' }} />
              <span>{userDetails?.phone || 'Not provided'}</span>
            </div>
            <button className="Rivaayaat-btn btn-sm d-flex align-items-center" onClick={() => setEdit(true)}>
              <FaEdit className="me-2" /> Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  ), [edit, profile, handleChange, handleEdit, handleCancelEdit, profileLoading, profileError, profileMsg, userDetails]);

  const OrdersSection = useMemo(() => (
    <div className="col-md-4">
      <div className="Rivaayaat-card h-100">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <FaBoxOpen size={28} style={{ color: 'var(--accent-color)', marginRight: 10 }} />
            <h5 className="mb-0" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Recent Orders</h5>
          </div>
          {ordersError && (
            <button className="btn btn-sm btn-outline-primary" onClick={retryOrders}>
              Retry
            </button>
          )}
        </div>
        {ordersLoading ? (
          <LoadingBar />
        ) : ordersError ? (
          <div className="text-center">
            <p className="text-danger mb-2">{ordersError}</p>
            <button className="btn btn-sm btn-primary" onClick={retryOrders}>
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-muted">No orders yet</p>
        ) : (
          <div className="orders-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {orders.slice(0, 5).map(order => (
              <div key={order._id} className="border-bottom pb-2 mb-2 cursor-pointer" onClick={() => handleShowOrder(order)}>
                <div className="d-flex justify-content-between">
                  <small className="fw-bold">Order #{order._id.slice(-6)}</small>
                  <small className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</small>
                </div>
                <div className="d-flex justify-content-between">
                  <small>₹{order.amountPaid}</small>
                  <small className={`badge ${order.status === 'Delivered' ? 'bg-success' : order.status === 'Processing' ? 'bg-warning' : 'bg-info'}`}>
                    {order.status}
                  </small>
                </div>
              </div>
            ))}
            {orders.length > 5 && (
              <small className="text-muted">+{orders.length - 5} more orders</small>
            )}
          </div>
        )}
      </div>
    </div>
  ), [orders, ordersLoading, ordersError, handleShowOrder, retryOrders]);

  const WishlistSection = useMemo(() => (
    <div className="col-md-4">
      <div className="Rivaayaat-card h-100">
        <div className="d-flex align-items-center mb-3">
          <FaHeart size={28} style={{ color: 'var(--accent-color)', marginRight: 10 }} />
          <h5 className="mb-0" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Wishlist</h5>
        </div>
        {wishlistLoading ? (
          <LoadingBar />
        ) : wishlist.length === 0 ? (
          <p className="text-muted">No items in wishlist</p>
        ) : (
          <div className="wishlist-preview" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {wishlist.slice(0, 3).map(item => (
              <WishlistItem key={item._id || item.productId} item={item} />
            ))}
            {wishlist.length > 3 && (
              <small className="text-muted">+{wishlist.length - 3} more items</small>
            )}
          </div>
        )}
      </div>
    </div>
  ), [wishlist, wishlistLoading]);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="Rivaayaat-heading mb-0">My Account</h1>
        {onLogout && (
          <button className="Rivaayaat-btn d-flex align-items-center" onClick={onLogout} style={{ minWidth: 110 }} aria-label="Logout">
            <FaSignOutAlt className="me-2" /> Logout
          </button>
        )}
      </div>
      
      <div className="row g-4 mb-4">
        {ProfileSection}
        {OrdersSection}
        {WishlistSection}
      </div>
      
      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={handleCloseOrder} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Order ID:</strong> {selectedOrder._id}
                </div>
                <div className="col-md-6">
                  <strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Status:</strong> 
                  <span className={`badge ms-2 ${selectedOrder.status === 'Delivered' ? 'bg-success' : selectedOrder.status === 'Processing' ? 'bg-warning' : 'bg-info'}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="col-md-6">
                  <strong>Total:</strong> ₹{selectedOrder.amountPaid}
                </div>
              </div>
              <hr />
              <h6>Items:</h6>
              {selectedOrder.items?.map((item, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                  <div>
                    <div className="fw-bold">{item.name}</div>
                    <small className="text-muted">Quantity: {item.quantity}</small>
                  </div>
                  <div className="text-end">
                    <div>₹{item.price}</div>
                    <small className="text-muted">₹{item.price * item.quantity} total</small>
                  </div>
                </div>
              ))}
              {selectedOrder.shippingAddress && (
                <>
                  <hr />
                  <h6>Shipping Address:</h6>
                  <p className="mb-0">
                    {selectedOrder.shippingAddress.address}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}<br />
                    {selectedOrder.shippingAddress.country || 'India'}
                  </p>
                </>
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
