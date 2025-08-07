import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaUserPlus, FaSignInAlt, FaHome, FaShoppingCart } from 'react-icons/fa';
import logo from '../assets/brandlogo.png'; // Adjust path if needed
// import '../css/NavbarPublic.css';
import '../css/theme.css';
import '../css/login.css';

const NavbarPublic = () => {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm py-2" style={{ background: 'var(--color-ivory)' }}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="header-logo-blend">
          <img
            src={logo}
            alt="Rivaayat Logo"
            className="logo-img"
            style={{ height: 44, marginRight: 10 }}
          />
          
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-between align-items-center">
          <Nav className="ms-auto align-items-center gap-3">
            <Nav.Link as={Link} to="/" className="cinzel">
              <FaHome style={{ marginBottom: 2 }} /> Home
            </Nav.Link>
            
            
            
            <Nav.Link as={Link} to="/login" className="cinzel">
              <FaSignInAlt style={{ marginBottom: 2 }} /> Login
            </Nav.Link>
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarPublic;