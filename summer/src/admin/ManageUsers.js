import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, Alert, Form, InputGroup, Modal, Pagination, Badge, Card } from 'react-bootstrap';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import { saveAs } from 'file-saver';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { 
  FaUsers, 
  FaSearch, 
  FaDownload, 
  FaEye, 
  FaBan, 
  FaUserPlus, 
  FaTrash,
  FaChartBar,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaClock
} from 'react-icons/fa';
import 'chart.js/auto';
import LoadingBar from '../components/LoadingBar';
import { adminNotifications } from '../utils/notifications';

const API = `${serverEndpoint}/api/admin/users`;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [productTrends, setProductTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  
  // ✅ New pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  // ✅ New filters state
  const [filters, setFilters] = useState({
    regStart: '',
    regEnd: '',
    loginStart: '',
    loginEnd: '',
    orderStart: '',
    orderEnd: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // ✅ New analytics state
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchProductTrends();
    // eslint-disable-next-line
  }, [pagination.page, pagination.limit, search, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        ...filters
      };
      
      const res = await axios.get(API, { params, withCredentials: true });
      
      if (res.data.success) {
        setUsers(res.data.users || []);
        setPagination(prev => ({
          ...prev,
          total: res.data.pagination?.total || 0,
          pages: res.data.pagination?.pages || 0
        }));
        setAnalytics(res.data.analytics);
      } else {
        throw new Error(res.data.message || 'Failed to fetch users');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch users';
      setError(errorMessage);
      adminNotifications.userError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductTrends = async () => {
    setTrendsLoading(true);
    try {
      const params = {};
      const res = await axios.get(`${serverEndpoint}/api/admin/product-trends`, { params, withCredentials: true });
      setProductTrends(res.data.trends || []);
    } catch (err) {
      console.error('Failed to fetch product trends:', err);
      setProductTrends([]);
    } finally {
      setTrendsLoading(false);
    }
  };

  // ✅ Enhanced filtering with debounce
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit) => {
    setPagination(prev => ({ ...prev, page: 1, limit: parseInt(limit) }));
  };

  // ✅ Enhanced user actions with better error handling
  const handlePromote = async (id) => {
    if (!window.confirm('Promote this user to admin?')) return;
    
    try {
      await axios.patch(`/api/admin/users/${id}/promote`, {}, { withCredentials: true });
      adminNotifications.userPromoted();
      fetchUsers(); // Refresh the list
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to promote user';
      adminNotifications.userError(errorMessage);
    }
  };

  const handleBlock = async (id) => {
    try {
      await axios.patch(`/api/admin/users/${id}/block`, {}, { withCredentials: true });
      adminNotifications.userBlocked();
      fetchUsers(); // Refresh the list
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update user status';
      adminNotifications.userError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`/api/admin/users/${id}`, { withCredentials: true });
      adminNotifications.userDeleted();
      fetchUsers(); // Refresh the list
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete user';
      adminNotifications.userError(errorMessage);
    }
  };

  // ✅ Enhanced view orders with pagination
  const handleViewOrders = async (user) => {
    setSelectedUser(user);
    setShowOrders(true);
    setOrdersLoading(true);
    
    try {
      const res = await axios.get(`/api/admin/users/${user._id}/orders`, { 
        withCredentials: true 
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      adminNotifications.userError('Failed to fetch user orders');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // ✅ Enhanced CSV export
  const exportCSV = () => {
    try {
      const header = [
        'ID', 'Name', 'Email', 'Username', 'Phone', 'Status', 
        'Registration Date', 'Last Login', 'Total Orders', 
        'Total Order Value', 'Most Popular Product'
      ];
      
      const rows = users.map(u => [
        u._id,
        u.name || '',
        u.email || '',
        u.username || '',
        u.phone || '',
        u.isBlocked ? 'Blocked' : 'Active',
        new Date(u.createdAt).toLocaleDateString(),
        u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never',
        u.totalOrders || 0,
        u.totalOrderValue || 0,
        u.mostPopularProduct?.name || 'None'
      ]);
      
      const csv = [header, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `users_export_${Date.now()}.csv`);
      
      adminNotifications.exportSuccess('Users exported successfully');
    } catch (err) {
      adminNotifications.exportError('Failed to export users');
    }
  };

  // ✅ Clear filters
  const clearFilters = () => {
    setSearch('');
    setFilters({
      regStart: '',
      regEnd: '',
      loginStart: '',
      loginEnd: '',
      orderStart: '',
      orderEnd: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return (
      <div className="admin-users">
        <LoadingBar />
      </div>
    );
  }

  return (
    <div className="admin-users">
      {/* Header Section */}
      <div className="users-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="users-title">
              <FaUsers className="title-icon" />
              User Management
            </h1>
            <p className="users-subtitle">
              Manage user accounts, permissions, and activity
            </p>
          </div>
          <div className="header-actions">
            <Button variant="outline-success" onClick={exportCSV}>
              <FaDownload className="me-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="analytics-section">
          <div className="analytics-grid">
            <Card className="analytics-card">
              <Card.Body>
                <div className="analytics-icon">
                  <FaUsers />
                </div>
                <div className="analytics-content">
                  <h3>{analytics.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="analytics-card">
              <Card.Body>
                <div className="analytics-icon">
                  <FaChartBar />
                </div>
                <div className="analytics-content">
                  <h3>{analytics.activeUsers}</h3>
                  <p>Active Users</p>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="analytics-card">
              <Card.Body>
                <div className="analytics-icon">
                  <FaCalendarAlt />
                </div>
                <div className="analytics-content">
                  <h3>{analytics.totalOrders}</h3>
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
                  <h3>₹{analytics.totalRevenue?.toFixed(2) || '0.00'}</h3>
                  <p>Total Revenue</p>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-box">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </div>
        
        <div className="filters-box">
          <div className="filter-row">
            <div className="filter-group">
              <label>Registration Date</label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={filters.regStart}
                  onChange={(e) => handleFilterChange('regStart', e.target.value)}
                  className="form-control"
                />
                <span>to</span>
                <input
                  type="date"
                  value={filters.regEnd}
                  onChange={(e) => handleFilterChange('regEnd', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="form-control"
              >
                <option value="createdAt">Registration Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="lastLogin">Last Login</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="form-control"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Per Page</label>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(e.target.value)}
                className="form-control"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          
          <div className="filter-actions">
            <Button variant="outline-secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="error-alert">
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Users Table */}
      <div className="users-container">
        <Table striped bordered hover responsive className="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Registration</th>
              <th>Last Login</th>
              <th>Orders</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  {search || Object.values(filters).some(f => f) 
                    ? 'No users found matching your criteria'
                    : 'No users found'
                  }
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user._id}>
                  <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{user.name || 'N/A'}</div>
                      <div className="user-username">@{user.username || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="contact-email">
                        <FaEnvelope className="contact-icon" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="contact-phone">
                          <FaPhone className="contact-icon" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge bg={user.isBlocked ? 'danger' : 'success'}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </td>
                  <td>
                    <div className="date-info">
                      <FaCalendarAlt className="date-icon" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <FaClock className="date-icon" />
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </td>
                  <td>
                    <div className="orders-info">
                      <span className="orders-count">{user.totalOrders || 0}</span>
                      {user.totalOrderValue > 0 && (
                        <span className="orders-value">
                          ₹{user.totalOrderValue.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewOrders(user)}
                        title="View Orders"
                      >
                        <FaEye />
                      </Button>
                      
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handlePromote(user._id)}
                        title="Promote to Admin"
                        disabled={user.isAdmin}
                      >
                        <FaUserPlus />
                      </Button>
                      
                      <Button
                        variant={user.isBlocked ? "outline-success" : "outline-warning"}
                        size="sm"
                        onClick={() => handleBlock(user._id)}
                        title={user.isBlocked ? "Unblock User" : "Block User"}
                      >
                        <FaBan />
                      </Button>
                      
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(user._id)}
                        title="Delete User"
                        disabled={user.totalOrders > 0}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination-section">
          <Pagination>
            <Pagination.First 
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
            />
            <Pagination.Prev 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            />
            
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const page = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i;
              return (
                <Pagination.Item
                  key={page}
                  active={page === pagination.page}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Pagination.Item>
              );
            })}
            
            <Pagination.Next 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            />
            <Pagination.Last 
              onClick={() => handlePageChange(pagination.pages)}
              disabled={pagination.page === pagination.pages}
            />
          </Pagination>
          
          <div className="pagination-info">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} users
          </div>
        </div>
      )}

      {/* Orders Modal */}
      <Modal show={showOrders} onHide={() => setShowOrders(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Orders for {selectedUser?.name || selectedUser?.email}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ordersLoading ? (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center text-muted">No orders found for this user.</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>
                      <Badge bg={
                        order.status === 'Delivered' ? 'success' :
                        order.status === 'Processing' ? 'warning' :
                        order.status === 'Cancelled' ? 'danger' : 'secondary'
                      }>
                        {order.status}
                      </Badge>
                    </td>
                    <td>₹{order.amountPaid || order.totalAmount || 0}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageUsers; 