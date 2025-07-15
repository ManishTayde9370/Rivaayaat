import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Form, FormControl } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import logo from '../assets/brandlogo.png';
import '../css/NavbarPrivate.css';
import CartIcon from './CartIcon';


const NavbarPrivate = ({ username, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    if (searchTerm.trim()) {
      console.log(`Searching for: ${searchTerm}`);
      // Add logic to navigate or filter based on searchTerm
    }
  };

  return (
    <Navbar bg="white" variant="light" expand="lg" className="shadow-sm py-2">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <img src={logo} alt="Rivaayat Logo" className="logo-img" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="user-navbar-nav" />
        <Navbar.Collapse id="user-navbar-nav" className="justify-content-between">
          {/* Left section - Nav Links */}
          <Nav className="me-auto align-items-center gap-3">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/product">Product</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            
          </Nav>

          {/* Middle section - Search */}
          <Form className="d-flex align-items-center me-3" onSubmit={e => e.preventDefault()}>
            <FormControl
  type="search"
  placeholder="Search"
  className="me-2 black-placeholder"
  aria-label="Search"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{ color: 'black' }} // makes typed input black
/>

            <FaSearch
              style={{ cursor: 'pointer', color: 'black' }}
              size={18}
              onClick={handleSearch}
              title="Search"
            />
          </Form>

          {/* Right section - Greeting & Logout */}
          <div className="d-flex align-items-center gap-3">
            <span className="text-dark">👋 Hello, <strong>{username}</strong></span>
            <CartIcon />
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarPrivate;
