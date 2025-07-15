// src/admin/AdminDashboard.js
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../css/admin-dashboard.css';


const AdminDashboard = () => {
  return (
    <>
    

      <Container fluid className="dashboard-bg text-center py-5 min-vh-100">
        <Row className="justify-content-center mb-5">
          <Col xs="auto">
            <h2 className="dashboard-header">
              🛠️ Admin Dashboard - Rivaayat
            </h2>
          </Col>
        </Row>

        <Row className="justify-content-center g-4 px-3">
          <Col md={6} lg={4}>
            <Card className="royal-card text-center h-100">
              <Card.Body>
                <Card.Title>🧵 Manage Products</Card.Title>
                <Card.Text>
                  Add, update, and delete products including images, prices, and descriptions.
                </Card.Text>
                <Link to="/admin/products">
                  <Button className="btn-gold rounded-pill px-4">Go</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4}>
            <Card className="royal-card text-center h-100">
              <Card.Body>
                <Card.Title>👥 Manage Users</Card.Title>
                <Card.Text>
                  View users, promote to admin, or block access.
                </Card.Text>
                <Link to="/admin/users">
                  <Button className="btn-gold rounded-pill px-4">Go</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4}>
            <Card className="royal-card text-center h-100">
              <Card.Body>
                <Card.Title>📦 Manage Orders</Card.Title>
                <Card.Text>
                  Track and update order statuses, view customer details.
                </Card.Text>
                <Link to="/admin/orders">
                  <Button className="btn-gold rounded-pill px-4">Go</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminDashboard;