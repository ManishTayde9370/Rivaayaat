import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { serverEndpoint } from '../components/config';
import { SET_USER, CLEAR_USER } from '../redux/user/actions';
import StatsCard from '../components/StatsCard';
import ActivityList from '../components/ActivityList';
import OrderItem from '../components/OrderItem';
import WishlistItem from '../components/WishlistItem';
import { Tab, Tabs } from 'react-bootstrap';
import '../css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.user);
  const reduxWishlist = useSelector((state) => state.wishlist.items);

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);

  // Pagination
  const itemsPerPage = 5;
  const [orderPage, setOrderPage] = useState(1);
  const [wishlistPage, setWishlistPage] = useState(1);
  const paginatedOrders = orders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);
  const paginatedWishlist = wishlist.slice((wishlistPage - 1) * itemsPerPage, wishlistPage * itemsPerPage);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.post(`${serverEndpoint}/api/auth/is-user-logged-in`, {}, {
          withCredentials: true,
        });

        if (res.data.userDetails) {
          dispatch({ type: SET_USER, payload: res.data.userDetails });
        } else {
          dispatch({ type: CLEAR_USER });
          navigate('/login');
        }
      } catch (error) {
        console.error('Not logged in or token expired:', error);
        dispatch({ type: CLEAR_USER });
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    if (!userDetails || !userDetails.username) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [userDetails, dispatch, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, wishlistRes, messagesRes] = await Promise.all([
          axios.get(`${serverEndpoint}/api/checkout/orders`, { withCredentials: true }),
          axios.get(`${serverEndpoint}/api/wishlist`, { withCredentials: true }),
          axios.get(`${serverEndpoint}/api/checkout/messages`, { withCredentials: true }),
        ]);

        setOrders(ordersRes.data);
        setWishlist(wishlistRes.data);
        setMessages(messagesRes.data);

        setActivities([
          ...ordersRes.data.map(order => ({
            id: order._id,
            action: `Placed an order for ${order.items.length} item(s)`,
            time: new Date(order.createdAt).toLocaleString(),
          })),
          ...wishlistRes.data.map(item => ({
            id: item._id,
            action: `Added "${item.name}" to wishlist`,
            time: new Date(item.addedAt).toLocaleDateString(),
          }))
        ]);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    fetchDashboardData();
  }, []);

  // Sync local wishlist with Redux wishlist for real-time updates
  useEffect(() => {
    setWishlist(reduxWishlist);
  }, [reduxWishlist]);

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${serverEndpoint}/api/auth/logout`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        dispatch({ type: CLEAR_USER });
        navigate('/login');
      } else {
        console.error('Unexpected logout response:', response.data);
      }
    } catch (error) {
      console.error('Logout failed:', error.response?.data || error.message);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <>
      <style>{`
        input, textarea, select { color: #111 !important; }
        input::placeholder, textarea::placeholder { color: #111 !important; opacity: 1; }
      `}</style>
      <div className="container py-5 dashboard-container" style={{ background: 'linear-gradient(135deg, #fcecc5 0%, #fffbe6 100%)', minHeight: '100vh', borderRadius: 24 }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 className="dashboard-title" style={{ color: '#5e3d19', fontFamily: 'Georgia', fontWeight: 'bold', letterSpacing: 1 }}>Welcome, {userDetails.username}</h2>
          <button className="btn btn-outline-danger btn-sm rounded-pill px-4" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="card shadow-lg p-4 mb-5" style={{ borderRadius: 20, background: 'rgba(255,255,255,0.97)' }}>
          <Tabs defaultActiveKey="overview" id="dashboard-tabs" className="mb-4 justify-content-center" style={{ borderBottom: '2px solid #fcecc5' }}>
            <Tab eventKey="overview" title="📊 Overview">
              <div className="row text-center mb-4">
                <div className="col-md-4">
                  <StatsCard title="Orders" icon="📦" count={orders.length} />
                </div>
                <div className="col-md-4">
                  <StatsCard title="Wishlist" icon="❤️" count={wishlist.length} />
                </div>
                <div className="col-md-4">
                  <StatsCard title="Messages" icon="💬" count={messages.length} />
                </div>
              </div>
              <hr style={{ borderTop: '1px solid #fcecc5' }} />
              <h5 className="mt-4" style={{ color: '#5e3d19' }}>🕒 Recent Activity</h5>
              <ActivityList activities={activities} />
            </Tab>

            <Tab eventKey="orders" title="🧾 My Orders">
              <div className="mt-4">
                {paginatedOrders.length === 0 ? (
                  <p>You haven't placed any orders yet.</p>
                ) : (
                  <>
                    {paginatedOrders.map(order => (
                      <OrderItem key={order._id} order={order} />
                    ))}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button className="btn btn-outline-secondary rounded-pill px-3" disabled={orderPage === 1} onClick={() => setOrderPage(orderPage - 1)}>Prev</button>
                      <span>Page {orderPage}</span>
                      <button className="btn btn-outline-secondary rounded-pill px-3" disabled={orderPage * itemsPerPage >= orders.length} onClick={() => setOrderPage(orderPage + 1)}>Next</button>
                    </div>
                  </>
                )}
              </div>
            </Tab>

            <Tab eventKey="wishlist" title="💖 Wishlist">
              <div className="mt-4">
                {paginatedWishlist.length === 0 ? (
                  <p>Your wishlist is currently empty.</p>
                ) : (
                  <>
                    {paginatedWishlist.map(item => (
                      <WishlistItem key={item._id} item={item} />
                    ))}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button className="btn btn-outline-secondary rounded-pill px-3" disabled={wishlistPage === 1} onClick={() => setWishlistPage(wishlistPage - 1)}>Prev</button>
                      <span>Page {wishlistPage}</span>
                      <button className="btn btn-outline-secondary rounded-pill px-3" disabled={wishlistPage * itemsPerPage >= wishlist.length} onClick={() => setWishlistPage(wishlistPage + 1)}>Next</button>
                    </div>
                  </>
                )}
              </div>
            </Tab>

            <Tab eventKey="account" title="👤 Account Info">
              <div className="mt-4">
                <div className="card p-4 shadow-sm" style={{ borderRadius: 16, background: '#fffbe6' }}>
                  <h6 style={{ color: '#5e3d19' }}>Name: {userDetails.username}</h6>
                  <p>Email: {userDetails.email || 'N/A'}</p>
                  <p>Member since: {userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
