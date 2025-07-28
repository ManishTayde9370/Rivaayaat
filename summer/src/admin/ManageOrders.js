import React, { useEffect, useState } from 'react';
import { Table, Container, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { FaBox, FaRupeeSign, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../css/admin-dashboard.css';

const statusOptions = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
const pageSizeOptions = [10, 20, 50, 100];

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [recentOrders, setRecentOrders] = useState([]); // Ensure it's always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthFilter, setMonthFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [allOrders, setAllOrders] = useState([]);

  // Separate filter state for analytics and for all orders
  const [analyticsStatusFilter, setAnalyticsStatusFilter] = useState('');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState('');
  const [ordersMonthFilter, setOrdersMonthFilter] = useState('');
  const [ordersEmailFilter, setOrdersEmailFilter] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchRecentOrders();
    fetchAllOrdersForStats().then(setAllOrders);
  }, [page, limit, monthFilter, emailFilter]);

  // ✅ Ensure recentOrders is always an array
  useEffect(() => {
    if (!Array.isArray(recentOrders)) {
      console.log('recentOrders is not an array, resetting to empty array');
      setRecentOrders([]);
    }
  }, [recentOrders]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
      };
      if (monthFilter) params.month = monthFilter;
      if (emailFilter) params.email = emailFilter;
      const res = await axios.get('http://localhost:5000/api/admin/orders', { params, withCredentials: true });
      if (res.data.success) {
        setOrders(res.data.orders || []);
        setTotal(res.data.total || 0);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/orders/recent', { withCredentials: true });
      console.log('Recent orders response:', res.data); // Debug log
      if (res.data.success) {
        const orders = res.data.orders || [];
        console.log('Setting recentOrders to:', orders); // Debug log
        setRecentOrders(Array.isArray(orders) ? orders : []);
      } else {
        console.log('API returned success: false, setting empty array'); // Debug log
        setRecentOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
      setRecentOrders([]);
    }
  };

  // Filtering logic
  const filteredOrders = Array.isArray(orders) ? orders.filter(o => {
    const d = new Date(o.createdAt);
    const matchesStatus = !ordersStatusFilter || o.status === ordersStatusFilter;
    const matchesMonth = !ordersMonthFilter || d.getMonth().toString() === ordersMonthFilter;
    const matchesEmail = !ordersEmailFilter || (o.user?.email || o.shippingAddress?.email || '').toLowerCase().includes(ordersEmailFilter.toLowerCase());
    return matchesStatus && matchesMonth && matchesEmail;
  }) : [];

  // Update order status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.patch(`http://localhost:5000/api/admin/orders/${id}/status`, { status: newStatus }, { withCredentials: true });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update status');
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const header = ['Order ID', 'User', 'Status', 'Amount', 'Date', 'Items'];
    const rows = filteredOrders.map(o => [
      o._id,
      o.user?.email || o.shippingAddress?.email || 'Guest',
      o.status,
      o.amountPaid || o.totalAmount || 0,
      new Date(o.createdAt).toLocaleString(),
      o.items?.length || 0
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `orders_export_${Date.now()}.csv`);
  };

  // Analytics
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const ordersByMonth = Array(12).fill(0);
  if (Array.isArray(orders)) {
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      ordersByMonth[d.getMonth()]++;
    });
  }

  // Repeat customers
  const customerCounts = {};
  if (Array.isArray(orders)) {
    orders.forEach(o => {
      const email = o.user?.email || o.shippingAddress?.email || 'Unknown';
      customerCounts[email] = (customerCounts[email] || 0) + 1;
    });
  }
  const repeatCustomers = Object.entries(customerCounts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);

  // Stats from all orders
  const totalOrders = Array.isArray(allOrders) ? allOrders.length : 0;
  const totalRevenue = Array.isArray(allOrders) ? allOrders.reduce((sum, o) => sum + (o.amountPaid || o.totalAmount || 0), 0) : 0;
  const pending = Array.isArray(allOrders) ? allOrders.filter(o => o.status === 'Pending').length : 0;
  const delivered = Array.isArray(allOrders) ? allOrders.filter(o => o.status === 'Delivered').length : 0;
  const cancelled = Array.isArray(allOrders) ? allOrders.filter(o => o.status === 'Cancelled').length : 0;

  // Helper to fetch all orders for stats
  const fetchAllOrdersForStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/orders', { params: { page: 1, limit: 10000 }, withCredentials: true });
      if (res.data.success) {
        return res.data.orders || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch all orders for stats:', error);
      return [];
    }
  };

  // For analytics, filter allOrders by analyticsStatusFilter
  const filteredAnalyticsOrders = Array.isArray(allOrders) ? (analyticsStatusFilter
    ? allOrders.filter(o => o.status === analyticsStatusFilter)
    : allOrders) : [];
  const analyticsStatusCounts = filteredAnalyticsOrders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const analyticsOrdersByMonth = Array(12).fill(0);
  filteredAnalyticsOrders.forEach(o => {
    const d = new Date(o.createdAt);
    analyticsOrdersByMonth[d.getMonth()]++;
  });

  // Pie chart color palette and status-to-color mapping
  const statusColorMap = {
    'Pending': '#fbbf24',
    'Processing': '#34d399',
    'Delivered': '#60a5fa',
    'Cancelled': '#f87171',
  };
  const pieColors = ['#fbbf24', '#34d399', '#f87171', '#60a5fa', '#a78bfa', '#f59e42', '#a3e635', '#f472b6', '#818cf8', '#facc15'];
  const analyticsStatusKeys = Object.keys(analyticsStatusCounts);
  const pieChartColors = analyticsStatusKeys.map(
    status => statusColorMap[status] || pieColors[analyticsStatusKeys.indexOf(status) % pieColors.length]
  );

  // Summary
  const statusBadge = status => {
    switch (status) {
      case 'Pending': return <span className="badge bg-warning text-dark">Pending</span>;
      case 'Processing': return <span className="badge bg-info text-dark">Processing</span>;
      case 'Delivered': return <span className="badge bg-success">Delivered</span>;
      case 'Cancelled': return <span className="badge bg-danger">Cancelled</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="dashboard-bg min-vh-100 py-5">
      <Container fluid>
        <h2 className="dashboard-header mb-4 text-center">📦 Manage Orders</h2>
        {loading && <div className="text-center"><Spinner animation="border" /></div>}
        {error && <Alert variant="danger" className="text-center">{error}</Alert>}
        {!loading && !error && (
          <>
            {/* Summary Stats Row */}
            <Row className="mb-4 g-3 justify-content-center flex-wrap">
              <Col xs={12} sm={6} md={2} className="mb-3">
                <div className="royal-card text-center p-3 h-100">
                  <FaBox size={28} className="mb-2 text-primary" />
                  <div className="fw-bold">Total Orders</div>
                  <div className="fs-4">{totalOrders}</div>
                </div>
              </Col>
              <Col xs={12} sm={6} md={2} className="mb-3">
                <div className="royal-card text-center p-3 h-100">
                  <FaRupeeSign size={28} className="mb-2 text-success" />
                  <div className="fw-bold">Revenue</div>
                  <div className="fs-4">₹{totalRevenue.toLocaleString()}</div>
                </div>
              </Col>
              <Col xs={12} sm={6} md={2} className="mb-3">
                <div className="royal-card text-center p-3 h-100">
                  <FaClock size={28} className="mb-2 text-warning" />
                  <div className="fw-bold">Pending</div>
                  <div className="fs-4">{pending}</div>
                </div>
              </Col>
              <Col xs={12} sm={6} md={2} className="mb-3">
                <div className="royal-card text-center p-3 h-100">
                  <FaCheckCircle size={28} className="mb-2 text-success" />
                  <div className="fw-bold">Delivered</div>
                  <div className="fs-4">{delivered}</div>
                </div>
              </Col>
              <Col xs={12} sm={6} md={2} className="mb-3">
                <div className="royal-card text-center p-3 h-100">
                  <FaTimesCircle size={28} className="mb-2 text-danger" />
                  <div className="fw-bold">Cancelled</div>
                  <div className="fs-4">{cancelled}</div>
                </div>
              </Col>
            </Row>
            {/* Analytics Filters */}
            <Row className="justify-content-center mb-3">
              <Col xs={12} md={8} className="d-flex justify-content-center">
                <div className="royal-card p-3 w-100" style={{ maxWidth: 700 }}>
                  <div className="d-flex flex-wrap align-items-center justify-content-center gap-3">
                    <span className="fw-bold me-2">Analytics Filter:</span>
                    <select className="form-select w-auto" value={analyticsStatusFilter} onChange={e => setAnalyticsStatusFilter(e.target.value)}>
                      <option value="">All Statuses</option>
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </Col>
            </Row>
            {/* Analytics and Recent Orders */}
            <Row className="g-4 mb-4 justify-content-center">
              <Col xs={12} className="mb-4 d-flex justify-content-center">
                <div className="royal-card p-3 w-100" style={{ minWidth: 350, maxWidth: 900 }}>
                  <h5 className="mb-3 text-center">Recent Orders</h5>
                  <Table size="sm" bordered hover responsive className="bg-light rounded align-middle table-striped w-100" style={{ fontSize: '0.95rem' }}>
                    <thead className="table-dark">
                      <tr>
                        <th>Order ID</th>
                        <th>User</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // ✅ Comprehensive safety check
                        if (!Array.isArray(recentOrders)) {
                          console.log('recentOrders is not an array, rendering loading state');
                          return (
                            <tr>
                              <td colSpan="5" className="text-center">Loading recent orders...</td>
                            </tr>
                          );
                        }
                        
                        if (recentOrders.length === 0) {
                          return (
                            <tr>
                              <td colSpan="5" className="text-center">No recent orders</td>
                            </tr>
                          );
                        }
                        
                        try {
                          return recentOrders.slice(0, 10).map(o => (
                            <tr key={o._id || Math.random()}>
                              <td>{o._id || 'N/A'}</td>
                              <td>{o.user?.email || o.shippingAddress?.email || 'Guest'}</td>
                              <td>{statusBadge(o.status)}</td>
                              <td>₹{(o.amountPaid || o.totalAmount || 0).toLocaleString()}</td>
                              <td>{new Date(o.createdAt).toLocaleString()}</td>
                            </tr>
                          ));
                        } catch (error) {
                          console.error('Error rendering recent orders:', error);
                          return (
                            <tr>
                              <td colSpan="5" className="text-center">Error loading recent orders</td>
                            </tr>
                          );
                        }
                      })()}
                    </tbody>
                  </Table>
                </div>
              </Col>
              <Col xs={12} className="mb-4 d-flex justify-content-center">
                <div className="d-flex flex-row justify-content-center align-items-stretch gap-4 w-100" style={{ maxWidth: 900 }}>
                  <div className="royal-card p-3 shadow w-100 d-flex flex-column align-items-center justify-content-center" style={{ minWidth: 320, maxWidth: 420 }}>
                    <h5 className="mb-3 text-center">Order Status Distribution</h5>
                    <div style={{ width: '100%', height: 260 }}>
                      <Pie data={{
                        labels: analyticsStatusKeys,
                        datasets: [{
                          data: Object.values(analyticsStatusCounts),
                          backgroundColor: pieChartColors,
                        }],
                      }} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                  </div>
                  <div className="royal-card p-3 shadow w-100 d-flex flex-column align-items-center justify-content-center" style={{ minWidth: 400, maxWidth: 480 }}>
                    <h5 className="mb-3 text-center">Orders Per Month</h5>
                    <div style={{ width: '100%', height: 260 }}>
                      <Bar data={{
                        labels: months,
                        datasets: [{
                          label: 'Orders',
                          data: analyticsOrdersByMonth,
                          backgroundColor: '#6366f1',
                        }],
                      }} options={{
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { barPercentage: 0.6, categoryPercentage: 0.6 },
                          y: { beginAtZero: true }
                        }
                      }} />
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
            {/* Repeat Customers */}
            <Row className="mb-4 justify-content-center">
              <Col xs={12} md={10} className="mx-auto d-flex justify-content-center">
                <div className="royal-card p-3 w-100" style={{ minWidth: 350, maxWidth: 700 }}>
                  <h5 className="mb-3 text-center">Top Repeat Customers</h5>
                  <Table size="sm" bordered hover responsive className="bg-light rounded align-middle table-striped w-100">
                    <thead className="table-dark">
                      <tr>
                        <th>Email</th>
                        <th>Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repeatCustomers.length === 0 ? (
                        <tr><td colSpan="2" className="text-center">No repeat customers</td></tr>
                      ) : (
                        repeatCustomers.map(([email, count]) => (
                          <tr key={email}>
                            <td>{email}</td>
                            <td>{count}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Col>
            </Row>
            {/* All Orders Filters */}
            <Row className="justify-content-center mb-3">
              <Col xs={12} md={10} className="mx-auto d-flex justify-content-center">
                <div className="royal-card p-3 w-100" style={{ maxWidth: 900 }}>
                  <div className="d-flex flex-wrap align-items-center justify-content-center gap-3">
                    <span className="fw-bold me-2">All Orders Filter:</span>
                    <select className="form-select w-auto" value={ordersStatusFilter} onChange={e => { setOrdersStatusFilter(e.target.value); setPage(1); }}>
                      <option value="">All Statuses</option>
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className="form-select w-auto" value={ordersMonthFilter} onChange={e => { setOrdersMonthFilter(e.target.value); setPage(1); }}>
                      <option value="">All Months</option>
                      {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    <input className="form-control w-auto" style={{ minWidth: 180 }} placeholder="Filter by customer email..." value={ordersEmailFilter} onChange={e => { setOrdersEmailFilter(e.target.value); setPage(1); }} />
                    <select className="form-select w-auto" value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
                      {pageSizeOptions.map(size => <option key={size} value={size}>{size} per page</option>)}
                    </select>
                    <button className="btn btn-gold" onClick={exportCSV}>Export CSV</button>
                  </div>
                </div>
              </Col>
            </Row>
            {/* All Orders Table with Pagination */}
            <Row className="flex-wrap justify-content-center">
              <Col xs={12} md={10} className="mx-auto d-flex justify-content-center">
                <div className="royal-card p-3 w-100" style={{ minWidth: 350, maxWidth: 900 }}>
                  <h5 className="mb-3 text-center">All Orders</h5>
                  <Table bordered hover responsive className="bg-light rounded align-middle table-striped w-100">
                    <thead className="table-dark">
                      <tr>
                        <th>Order ID</th>
                        <th>User</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(o => (
                        <tr key={o._id}>
                          <td>{o._id}</td>
                          <td>{o.user?.email || o.shippingAddress?.email || 'Guest'}</td>
                          <td>{statusBadge(o.status)}</td>
                          <td>₹{(o.amountPaid || o.totalAmount || 0).toLocaleString()}</td>
                          <td>{new Date(o.createdAt).toLocaleString()}</td>
                          <td>{o.items?.length || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {/* Pagination Controls */}
                  <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
                    <span>Page {page} of {Math.ceil(totalOrders / limit) || 1}</span>
                    <div>
                      <button className="btn btn-sm btn-outline-primary me-2" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                      <button className="btn btn-sm btn-outline-primary" disabled={page * limit >= totalOrders} onClick={() => setPage(page + 1)}>Next</button>
                    </div>
                    <span>Total Orders: {totalOrders}</span>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default ManageOrders; 