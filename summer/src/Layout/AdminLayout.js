// src/Layout/AdminLayout.js
import React, { useState } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaEnvelope, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaBell,
  FaUser,
  FaChevronDown,
  FaCrown
} from 'react-icons/fa';

const AdminLayout = ({ children, userDetails, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  };

  const navigationItems = [
    { title: 'Dashboard', path: '/admin', icon: <FaHome /> },
    { title: 'Products', path: '/admin/products', icon: <FaBox /> },
    { title: 'Orders', path: '/admin/orders', icon: <FaShoppingCart /> },
    { title: 'Users', path: '/admin/users', icon: <FaUsers /> },
  ];

  const isActiveRoute = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Enhanced Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <FaCrown className="brand-icon" />
            <span className="brand-text">Rivaayat Admin</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="sidebar-content">
          <nav className="sidebar-nav">
            {navigationItems.map((item, index) => (
              <div key={index} className="nav-item-wrapper">
                <button
                  className={`nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.title}</span>
                  {item.badge && (
                    <Badge bg="danger" className="nav-badge">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              </div>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <div className="user-name">
                {userDetails?.name || 'Admin User'}
              </div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="admin-main">
        {/* Enhanced Top Navigation */}
        <div className="admin-top-nav">
          <div className="nav-left">
            <button 
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars />
            </button>
            <div className="breadcrumb">
              {navigationItems.find(item => isActiveRoute(item.path))?.title || 'Dashboard'}
            </div>
          </div>

          <div className="nav-right">
            <div className="nav-actions">
              <Dropdown className="user-dropdown">
                <Dropdown.Toggle as="div" className="user-toggle">
                  <div className="user-avatar-small">
                    <FaUser />
                  </div>
                  <span className="user-name-small">
                    {userDetails?.name || 'Admin'}
                  </span>
                  <FaChevronDown className="dropdown-arrow" />
                </Dropdown.Toggle>
                
                <Dropdown.Menu className="user-dropdown-menu">
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className="admin-content">
          {children}
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;