// src/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaEnvelope, 
  FaChartBar, 
  FaCog, 
  FaPlus,
  FaEye
} from 'react-icons/fa';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import '../css/theme.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalMessages: 0,
    recentOrders: [],
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const [usersRes, productsRes, ordersRes, messagesRes, recentOrdersRes] = await Promise.all([
        axios.get(`${serverEndpoint}/api/admin/users/analytics`, { withCredentials: true }),
        axios.get(`${serverEndpoint}/api/products`, { withCredentials: true }),
        axios.get(`${serverEndpoint}/api/admin/orders/analytics`, { withCredentials: true }),
        axios.get(`${serverEndpoint}/api/contact/messages`, { withCredentials: true }),
        axios.get(`${serverEndpoint}/api/admin/orders/recent`, { withCredentials: true })
      ]);

      const statsData = {
        totalUsers: usersRes.data?.analytics?.totalUsers || 0,
        totalProducts: productsRes.data?.products?.length || 0,
        totalOrders: ordersRes.data?.analytics?.totalOrders || 0,
        totalMessages: Array.isArray(messagesRes.data) ? messagesRes.data.length : (messagesRes.data?.messages?.length || 0),
        recentOrders: recentOrdersRes.data?.orders || [],
        recentUsers: usersRes.data?.recentUsers || []
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalMessages: 0,
        recentOrders: [],
        recentUsers: []
      });
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: 'Manage Products',
      description: 'Add, update, and delete products',
      icon: <FaBox />,
      link: '/admin/products',
      color: 'maroon',
      badge: stats.totalProducts
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <FaUsers />,
      link: '/admin/users',
      color: 'peacock',
      badge: stats.totalUsers
    },
    {
      title: 'Manage Orders',
      description: 'Track and manage customer orders',
      icon: <FaShoppingCart />,
      link: '/admin/orders',
      color: 'turmeric',
      badge: stats.totalOrders
    },
    {
      title: 'Contact Messages',
      description: 'View customer inquiries and feedback',
      icon: <FaEnvelope />,
      link: '/admin/contact-messages',
      color: 'indigo',
      badge: stats.totalMessages
    }
  ];

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Create a new product',
      icon: <FaPlus />,
      link: '/admin/add-product',
      color: 'maroon'
    },
    {
      title: 'View Analytics',
      description: 'Check platform statistics',
      icon: <FaChartBar />,
      link: '/admin/analytics',
      color: 'peacock'
    },
    {
      title: 'Settings',
      description: 'Manage platform settings',
      icon: <FaCog />,
      link: '/admin/settings',
      color: 'turmeric'
    }
  ];

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="rivaayat-motif">
            <div className="rivaayat-loader mb-3" />
            <h4 className="cinzel text-earth mb-2">Loading Dashboard</h4>
            <p className="inter text-forest">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
              <div className="text-center mb-5">
          <h1 className="rivaayat-heading text-earth">
            Admin Dashboard
          </h1>
          <p className="rivaayat-subheading text-forest">
            Manage your Rivaayat platform
          </p>
        </div>

      {/* Stats Overview */}
      <Row className="mb-5">
        <Col lg={3} md={6} className="mb-4">
          <div className="rivaayat-card text-center">
            <div className="rivaayat-badge rivaayat-badge-maroon mb-3" style={{ fontSize: '2rem' }}>
              <FaUsers />
            </div>
            <h3 className="cinzel text-earth mb-2">{stats.totalUsers}</h3>
            <p className="inter text-forest mb-0">Total Users</p>
          </div>
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <div className="rivaayat-card text-center">
            <div className="rivaayat-badge rivaayat-badge-peacock mb-3" style={{ fontSize: '2rem' }}>
              <FaBox />
            </div>
            <h3 className="cinzel text-forest mb-2">{stats.totalProducts}</h3>
            <p className="inter text-earth mb-0">Total Products</p>
          </div>
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <div className="rivaayat-card text-center">
            <div className="rivaayat-badge rivaayat-badge-turmeric mb-3" style={{ fontSize: '2rem' }}>
              <FaShoppingCart />
            </div>
            <h3 className="cinzel text-amber mb-2">{stats.totalOrders}</h3>
            <p className="inter text-forest mb-0">Total Orders</p>
          </div>
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <div className="rivaayat-card text-center">
            <div className="rivaayat-badge rivaayat-badge-indigo mb-3" style={{ fontSize: '2rem' }}>
              <FaEnvelope />
            </div>
            <h3 className="cinzel text-warm-gray mb-2">{stats.totalMessages}</h3>
            <p className="inter text-forest mb-0">Messages</p>
          </div>
        </Col>
      </Row>

      {/* Management Cards */}
      <Row className="mb-5">
        <Col lg={12}>
          <h3 className="cinzel text-earth mb-4 text-center">
            Management
          </h3>
        </Col>
        {dashboardCards.map((card, index) => (
          <Col lg={6} className="mb-4" key={index}>
            <div className="rivaayat-card h-100">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="rivaayat-badge" style={{ fontSize: '1.5rem' }}>
                  {card.icon}
                </div>
                <span className="rivaayat-badge rivaayat-badge-maroon">
                  {card.badge}
                </span>
              </div>
              <h4 className="cinzel text-earth mb-3">{card.title}</h4>
              <p className="inter text-forest mb-4">{card.description}</p>
              <Link to={card.link} className="rivaayat-btn btn-sm">
                <FaEye className="me-2" />
                Manage
              </Link>
            </div>
          </Col>
        ))}
      </Row>

      {/* Quick Actions removed as requested */}

      {/* Recent Activity */}
      <Row>
        <Col lg={6} className="mb-4">
          <div className="rivaayat-card">
            <h4 className="cinzel text-earth mb-3">
              Recent Orders
            </h4>
            {stats.recentOrders.length > 0 ? (
              <div>
                {stats.recentOrders.slice(0, 5).map((order, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                    <div>
                                        <p className="inter text-forest mb-0">Order #{order._id?.slice(-6)}</p>
                  <small className="text-muted">{order.status}</small>
                    </div>
                    <span className="rivaayat-badge">₹{(order.amountPaid || order.total || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
                              <p className="inter text-forest">No recent orders</p>
            )}
            <Link to="/admin/orders" className="rivaayat-btn btn-sm mt-3">
              View All Orders
            </Link>
          </div>
        </Col>
        
        <Col lg={6} className="mb-4">
          <div className="rivaayat-card">
            <h4 className="cinzel text-earth mb-3">
              Recent Users
            </h4>
            {stats.recentUsers.length > 0 ? (
              <div>
                {stats.recentUsers.slice(0, 5).map((user, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                    <div>
                                        <p className="inter text-forest mb-0">{user.name || user.email}</p>
                  <small className="text-muted">{user.email}</small>
                    </div>
                    <span className="rivaayat-badge rivaayat-badge-maroon">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
                              <p className="inter text-forest">No recent users</p>
            )}
            <Link to="/admin/users" className="rivaayat-btn btn-sm mt-3">
              View All Users
            </Link>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;