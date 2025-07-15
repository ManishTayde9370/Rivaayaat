// src/Layout/AdminLayout.js
import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AdminLayout = ({ children, userDetails, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 🔄 Clear admin state & redirect
    if (onLogout) onLogout();
    navigate('/login', { replace: true }); // ✅ redirect after logout
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>Rivaayat Admin</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <Nav.Link onClick={() => navigate('/admin')}>Dashboard</Nav.Link>
              <Nav.Link onClick={() => navigate('/admin/users')}>Users</Nav.Link>
              <Nav.Link onClick={() => navigate('/admin/products')}>Products</Nav.Link>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid>{children}</Container>
    </>
  );
};

export default AdminLayout;