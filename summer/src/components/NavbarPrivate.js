import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Form, FormControl, CloseButton } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import logo from '../assets/brandlogo.png';
import '../css/NavbarPrivate.css';
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
          // Pass results to product page via navigation state
          navigate('/product', { 
            state: { 
              searchResults: res.data.products, 
              searchTerm, 
              notFound: res.data.products.length === 0 
            } 
          });
        } else {
          console.error('Search failed:', res.data.message);
          // Navigate with empty results
          navigate('/product', { 
            state: { 
              searchResults: [], 
              searchTerm, 
              notFound: true 
            } 
          });
        }
      } catch (err) {
        console.error('Search error:', err);
        // Navigate with empty results on error
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

  // Helper: Split searchTerm into keywords
  const keywords = searchTerm.split(/\s+/).filter(Boolean);

  // Remove a keyword chip
  const handleRemoveKeyword = (kw) => {
    const newKeywords = keywords.filter(k => k !== kw);
    setSearchTerm(newKeywords.join(' '));
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
