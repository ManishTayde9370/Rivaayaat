import React, { useEffect, useState } from 'react';
import { Table, Container, Spinner, Alert, Row, Col, Card } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
import { saveAs } from 'file-saver';

const statusOptions = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/admin/orders', { withCredentials: true });
      setOrders(res.data || []);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  const filteredOrders = orders.filter(o => {
    const d = new Date(o.createdAt);
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesMonth = !monthFilter || d.getMonth().toString() === monthFilter;
    const matchesEmail = !emailFilter || (o.user?.email || o.shippingAddress?.email || '').toLowerCase().includes(emailFilter.toLowerCase());
    return matchesStatus && matchesMonth && matchesEmail;
  });

  // Update order status
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await axios.patch(`/api/admin/orders/${id}/status`, { status: newStatus }, { withCredentials: true });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
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
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const ordersByMonth = Array(12).fill(0);
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    ordersByMonth[d.getMonth()]++;
  });

  // Repeat customers
  const customerCounts = {};
  orders.forEach(o => {
    const email = o.user?.email || o.shippingAddress?.email || 'Unknown';
    customerCounts[email] = (customerCounts[email] || 0) + 1;
  });
  const repeatCustomers = Object.entries(customerCounts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);

  // Summary
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amountPaid || o.totalAmount || 0), 0);
  const pending = statusCounts['Pending'] || 0;
  const delivered = statusCounts['Delivered'] || 0;
  const cancelled = statusCounts['Cancelled'] || 0;

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-center">Manage Orders</h2>
      {loading && <div className="text-center"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      {!loading && !error && (
        <>
          {/* Filters */}
          <Row className="mb-3">
            <Col md={3}>
              <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Col>
            <Col md={3}>
              <select className="form-select" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
                <option value="">All Months</option>
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </Col>
            <Col md={4}>
              <input className="form-control" placeholder="Filter by customer email..." value={emailFilter} onChange={e => setEmailFilter(e.target.value)} />
            </Col>
            <Col md={2} className="text-end">
              <button className="btn btn-outline-success w-100" onClick={exportCSV}>Export CSV</button>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <h5 className="text-center">Order Status Distribution</h5>
              <Pie data={{
                labels: Object.keys(statusCounts),
                datasets: [{
                  data: Object.values(statusCounts),
                  backgroundColor: ['#fbbf24', '#34d399', '#f87171', '#60a5fa', '#a78bfa'],
                }],
              }} />
            </Col>
            <Col md={6}>
              <h5 className="text-center">Orders Per Month</h5>
              <Bar data={{
                labels: months,
                datasets: [{
                  label: 'Orders',
                  data: ordersByMonth,
                  backgroundColor: '#6366f1',
                }],
              }} />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <h5>Top Repeat Customers</h5>
              <Table size="sm" bordered hover>
                <thead>
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
            </Col>
            <Col md={6}>
              <h5>Recent Orders</h5>
              <Table size="sm" bordered hover>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map(o => (
                    <tr key={o._id}>
                      <td>{o._id}</td>
                      <td>{o.user?.email || o.shippingAddress?.email || 'Guest'}</td>
                      <td>{o.status}</td>
                      <td>₹{(o.amountPaid || o.totalAmount || 0).toLocaleString()}</td>
                      <td>{new Date(o.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
          <Row>
            <Col>
              <h5>All Orders</h5>
              <Table bordered hover responsive>
                <thead>
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
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={o.status}
                          disabled={updatingId === o._id}
                          onChange={e => handleStatusChange(o._id, e.target.value)}
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>₹{(o.amountPaid || o.totalAmount || 0).toLocaleString()}</td>
                      <td>{new Date(o.createdAt).toLocaleString()}</td>
                      <td>{o.items?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default ManageOrders; 