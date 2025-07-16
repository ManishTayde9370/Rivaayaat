import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Form, FormControl, CloseButton } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import logo from '../assets/brandlogo.png';
import '../css/NavbarPrivate.css';
import CartIcon from './CartIcon';
import axios from 'axios';


const NavbarPrivate = ({ username, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/search?keyword=${encodeURIComponent(searchTerm)}`);
        // Pass results to product page via navigation state
        navigate('/product', { state: { searchResults: res.data.products, searchTerm, notFound: res.data.products.length === 0 } });
      } catch (err) {
        console.error('Search error:', err);
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

          {/* Middle section - Search */}
          <Form className="d-flex align-items-center me-3 flex-column" onSubmit={e => e.preventDefault()} style={{ minWidth: 250 }}>
            <div className="d-flex align-items-center w-100">
              <FormControl
                type="search"
                placeholder="Search products (e.g. red silk saree)"
                className="me-2 black-placeholder custom-search-input"
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: '2px solid black', minWidth: 180 }}
              />
              <FaSearch
                style={{ cursor: 'pointer', color: 'black' }}
                size={18}
                onClick={handleSearch}
                title="Search"
              />
            </div>
            {/* Keyword chips */}
            <div className="d-flex flex-wrap mt-1 mb-1" style={{ minHeight: 28 }}>
              {keywords.map((kw, idx) => (
                <span key={kw + idx} className="badge bg-secondary me-1 mb-1 d-flex align-items-center" style={{ fontSize: '0.9em' }}>
                  {kw}
                  <CloseButton onClick={() => handleRemoveKeyword(kw)} className="ms-1 p-0" style={{ fontSize: '0.8em' }} />
                </span>
              ))}
            </div>
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
