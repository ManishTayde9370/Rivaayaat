import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaUserPlus, FaSignInAlt, FaHome } from 'react-icons/fa';
import logo from '../assets/brandlogo.png';
import '../css/theme.css';

const NavbarPublic = () => {
  return (
    <Navbar expand="lg" className="Rivaayaat-nav py-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src={logo}
            alt="Rivaayaat Logo"
            style={{ height: 45 }}
            className="diya-flicker"
          />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" className="border-0" />
        
        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="Rivaayaat-nav-link">
              <FaHome className="me-1" /> Home
            </Nav.Link>
            
            <Nav.Link as={Link} to="/login" className="Rivaayaat-nav-link">
              <FaSignInAlt className="me-1" /> Login
            </Nav.Link>
            
            <Nav.Link as={Link} to="/register" className="Rivaayaat-nav-link">
              <FaUserPlus className="me-1" /> Register
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarPublic;