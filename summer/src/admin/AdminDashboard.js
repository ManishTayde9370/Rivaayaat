// src/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaEnvelope, 
  FaChartBar, 
  FaCog, 
  FaBell,
  FaArrowRight,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaCrown,
  FaTachometerAlt,
  FaClipboardList
} from 'react-icons/fa';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import LoadingBar from '../components/LoadingBar';
import '../css/admin-dashboard.css';

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
      
      // Fetch real statistics from backend
      const [usersRes, productsRes, ordersRes, messagesRes] = await Promise.all([
        axios.get(`${serverEndpoint}/api/admin/users/analytics`, { withCredentials: true }),
        axios.get(`${serverEndpoint}/api/products`, { withCredentials: true }),
        axios.get(`${serverEndpoint}/api/admin/orders/analytics`, { withCredentials: true }),
        axios.get(`${serverEndpoint}/api/contact/messages`, { withCredentials: true })
      ]);

      const statsData = {
        totalUsers: usersRes.data?.analytics?.totalUsers || 0,
        totalProducts: productsRes.data?.products?.length || 0,
        totalOrders: ordersRes.data?.analytics?.totalOrders || 0,
        totalMessages: messagesRes.data?.messages?.length || 0,
        recentOrders: ordersRes.data?.recentOrders || [],
        recentUsers: usersRes.data?.recentUsers || []
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to zero values instead of mock data
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
      description: 'Add, update, and delete products with images, prices, and descriptions',
      icon: <FaBox />,
      link: '/admin/products',
      color: 'primary',
      badge: stats.totalProducts,
      actions: [
        { label: 'View All', icon: <FaEye />, action: 'view' },
        { label: 'Add New', icon: <FaPlus />, action: 'add' }
      ]
    },
    {
      title: 'Manage Users',
      description: 'View, search, and manage users. Track registration, roles, and activity',
      icon: <FaUsers />,
      link: '/admin/users',
      color: 'success',
      badge: stats.totalUsers,
      actions: [
        { label: 'View All', icon: <FaEye />, action: 'view' },
        { label: 'Analytics', icon: <FaChartBar />, action: 'analytics' }
      ]
    },
    {
      title: 'Manage Orders',
      description: 'Track, analyze, and update order statuses. View customer analytics',
      icon: <FaShoppingCart />,
      link: '/admin/orders',
      color: 'warning',
      badge: stats.totalOrders,
      actions: [
        { label: 'View All', icon: <FaEye />, action: 'view' },
        { label: 'Reports', icon: <FaChartBar />, action: 'reports' }
      ]
    },
    {
      title: 'Contact Messages',
      description: 'View and manage messages submitted via the Contact Us form',
      icon: <FaEnvelope />,
      link: '/admin/contact-messages',
      color: 'info',
      badge: stats.totalMessages,
      actions: [
        { label: 'View All', icon: <FaEye />, action: 'view' },
        { label: 'Mark Read', icon: <FaEdit />, action: 'mark-read' }
      ]
    },
    {
      title: 'Review Analytics',
      description: 'Monitor product reviews, ratings, and customer feedback',
      icon: <FaChartBar />,
      link: '/admin/reviews',
      color: 'secondary',
      badge: 'New',
      actions: [
        { label: 'View Analytics', icon: <FaChartBar />, action: 'analytics' },
        { label: 'Reports', icon: <FaEye />, action: 'reports' }
      ]
    },
    {
      title: 'Settings',
      description: 'Configure platform settings, security, and system preferences',
      icon: <FaCog />,
      link: '/admin/settings',
      color: 'dark',
      badge: 'Config',
      actions: [
        { label: 'General', icon: <FaCog />, action: 'general' },
        // { label: 'Security', icon: <FaBell />, action: 'security' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="admin-container">
        <LoadingBar message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Enhanced Header Section */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="admin-title">
              <FaCrown className="title-icon" />
              Admin Dashboard
            </h1>
            <p className="admin-subtitle">
              Manage your Rivaayat e-commerce platform with powerful tools and analytics
            </p>
          </div>
          <div className="header-right">
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.totalUsers}</span>
                <span className="stat-label">Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalProducts}</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalOrders}</span>
                <span className="stat-label">Orders</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="analytics-section">
        <div className="analytics-grid">
          <Card className="analytics-card">
            <Card.Body>
              <div className="analytics-icon">
                <FaUsers />
              </div>
              <div className="analytics-content">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="analytics-card">
            <Card.Body>
              <div className="analytics-icon">
                <FaBox />
              </div>
              <div className="analytics-content">
                <h3>{stats.totalProducts}</h3>
                <p>Total Products</p>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="analytics-card">
            <Card.Body>
              <div className="analytics-icon">
                <FaShoppingCart />
              </div>
              <div className="analytics-content">
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="analytics-card">
            <Card.Body>
              <div className="analytics-icon">
                <FaEnvelope />
              </div>
              <div className="analytics-content">
                <h3>{stats.totalMessages}</h3>
                <p>Messages</p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="search-filters-section">
        <div className="actions-header">
          <h3>Quick Actions</h3>
          <p>Common tasks to get you started</p>
        </div>
        <div className="actions-grid">
          <Link to="/admin/products/add" className="action-card add-product">
            <FaPlus className="action-icon" />
            <span>Add Product</span>
          </Link>
          <Link to="/admin/users" className="action-card view-users">
            <FaUsers className="action-icon" />
            <span>View Users</span>
          </Link>
          <Link to="/admin/orders" className="action-card view-orders">
            <FaShoppingCart className="action-icon" />
            <span>Recent Orders</span>
          </Link>
          <Link to="/admin/contact-messages" className="action-card view-messages">
            <FaEnvelope className="action-icon" />
            <span>Messages</span>
          </Link>
        </div>
      </div>

      {/* Main Dashboard Cards */}
      <div className="dashboard-grid">
        {dashboardCards.map((card, index) => (
          <div key={index} className="dashboard-card">
            <Card className={`h-100 border-0 shadow-sm card-${card.color}`}>
              <Card.Body className="p-4">
                <div className="card-header">
                  <div className="card-icon-wrapper">
                    {card.icon}
                  </div>
                  <Badge bg={card.color} className="card-badge">
                    {card.badge}
                  </Badge>
                </div>
                
                <Card.Title className="card-title mt-3">
                  {card.title}
                </Card.Title>
                
                <Card.Text className="card-description">
                  {card.description}
                </Card.Text>
                
                <div className="card-actions">
                  <Link to={card.link} className="btn btn-primary btn-sm">
                    <FaArrowRight className="me-2" />
                    Manage
                  </Link>
                  
                  <div className="action-buttons">
                    {card.actions.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant="outline-secondary"
                        size="sm"
                        className="action-btn"
                        title={action.label}
                      >
                        {action.icon}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity mt-5">
        <div className="activity-header">
          <h3>Recent Activity</h3>
          <p>Latest updates and notifications</p>
        </div>
        
        <Row>
          <Col lg={6}>
            <Card className="activity-card">
              <Card.Header>
                <h5 className="mb-0">
                  <FaShoppingCart className="me-2" />
                  Recent Orders
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon order-icon">
                      <FaShoppingCart />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">New order received</div>
                      <div className="activity-desc">Order #1234 - ₹2,500</div>
                      <div className="activity-time">2 minutes ago</div>
                    </div>
                  </div>
                  
                  <div className="activity-item">
                    <div className="activity-icon order-icon">
                      <FaShoppingCart />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Order shipped</div>
                      <div className="activity-desc">Order #1233 - ₹1,800</div>
                      <div className="activity-time">15 minutes ago</div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={6}>
            <Card className="activity-card">
              <Card.Header>
                <h5 className="mb-0">
                  <FaUsers className="me-2" />
                  New Users
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon user-icon">
                      <FaUsers />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">New user registered</div>
                      <div className="activity-desc">john.doe@example.com</div>
                      <div className="activity-time">5 minutes ago</div>
                    </div>
                  </div>
                  
                  <div className="activity-item">
                    <div className="activity-icon user-icon">
                      <FaUsers />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">User profile updated</div>
                      <div className="activity-desc">jane.smith@example.com</div>
                      <div className="activity-time">1 hour ago</div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminDashboard;