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
    <Navbar expand="lg" className="Rivaayaat-nav py-3">
      <Container>
        <Navbar.Brand as={Link} to="/homeprivate" className="d-flex align-items-center">
          <img 
            src={logo} 
            alt="Rivaayaat Logo" 
            style={{ height: 45 }}
            className="diya-flicker"
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="user-navbar-nav" className="border-0" />
        
        <Navbar.Collapse id="user-navbar-nav" className="justify-content-between">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="Rivaayaat-nav-link">
              <FaHome className="me-1" /> Home
            </Nav.Link>
            
            <Nav.Link as={Link} to="/product" className="Rivaayaat-nav-link">
              <FaShoppingBag className="me-1" /> Shop
            </Nav.Link>
            
            <Nav.Link as={Link} to="/dashboard" className="Rivaayaat-nav-link">
              <FaUserCircle className="me-1" /> Dashboard
            </Nav.Link>
          </Nav>
          {/* Search Bar */}
          <div className="d-flex align-items-center ms-auto me-3">
          <Form className="d-flex" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <FormControl
              type="search"
              placeholder="Search products..."
              className="Rivaayaat-input me-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: '200px' }}
            />
            <button 
              type="submit" 
              className="Rivaayaat-btn"
              style={{ padding: '0.75rem 1rem' }}
            >
              <FaSearch />
            </button>
          </Form>
          </div>
        </Navbar.Collapse>
        
        {/* User Menu and Cart - Cart at absolute end */}
        <Nav className="ms-auto align-items-center">
          <NavDropdown 
            title={
              <span className="Rivaayaat-nav-link d-inline-flex align-items-center">
                <FaUser className="me-1" />
                {username}
              </span>
            } 
            className="Rivaayaat-nav-link"
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
          <div className="ms-3">
            <CartIcon />
          </div>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavbarPrivate;
