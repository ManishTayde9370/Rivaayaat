import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Form, FormControl, NavDropdown } from 'react-bootstrap';
import { FaSearch, FaUser, FaSignOutAlt, FaShoppingCart, FaHome, FaShoppingBag, FaUserCircle } from 'react-icons/fa';
import logo from '../assets/brandlogo.png';
import '../css/theme.css';
import CartIcon from './CartIcon';
import axios from 'axios';
import { serverEndpoint } from './config';

const NavbarPrivate = ({ username, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const res = await axios.get(`${serverEndpoint}/api/products/search?keyword=${encodeURIComponent(searchTerm.trim())}`, {
          withCredentials: true
        });
        
        if (res.data.success) {
          navigate('/product', { 
            state: { 
              searchResults: res.data.products, 
              searchTerm, 
              notFound: res.data.products.length === 0 
            } 
          });
        } else {
          navigate('/product', { 
            state: { 
              searchResults: [], 
              searchTerm, 
              notFound: true 
            } 
          });
        }
      } catch (err) {
        navigate('/product', { 
          state: { 
            searchResults: [], 
            searchTerm, 
            notFound: true 
          } 
        });
      }
    }
  };

  return (
    <Navbar expand="lg" className="rivaayat-nav py-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img 
            src={logo} 
            alt="Rivaayat Logo" 
            style={{ height: 45 }}
            className="diya-flicker"
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="user-navbar-nav" className="border-0" />
        
        <Navbar.Collapse id="user-navbar-nav" className="justify-content-center">
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/" className="rivaayat-nav-link">
              <FaHome className="me-1" /> Home
            </Nav.Link>
            
            <Nav.Link as={Link} to="/product" className="rivaayat-nav-link">
              <FaShoppingBag className="me-1" /> Shop
            </Nav.Link>
            
            <Nav.Link as={Link} to="/dashboard" className="rivaayat-nav-link">
              <FaUserCircle className="me-1" /> Dashboard
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        
        {/* Search Bar */}
        <div className="d-flex align-items-center me-3">
          <Form className="d-flex" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <FormControl
              type="search"
              placeholder="Search products..."
              className="rivaayat-input me-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: '200px' }}
            />
            <button 
              type="submit" 
              className="rivaayat-btn"
              style={{ padding: '0.75rem 1rem' }}
            >
              <FaSearch />
            </button>
          </Form>
        </div>
        
        {/* User Menu */}
        <Nav className="ms-auto">
          <CartIcon />
          <NavDropdown 
            title={
              <span className="rivaayat-nav-link d-inline-flex align-items-center">
                <FaUser className="me-1" />
                {username}
              </span>
            } 
            className="rivaayat-nav-link"
            id="user-dropdown"
          >
            <NavDropdown.Item as={Link} to="/dashboard" className="cinzel">
              🏠 Dashboard
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/profile" className="cinzel">
              👤 Profile
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/orders" className="cinzel">
              📦 Orders
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={onLogout} className="cinzel text-danger">
              <FaSignOutAlt className="me-1" /> Logout
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavbarPrivate;
