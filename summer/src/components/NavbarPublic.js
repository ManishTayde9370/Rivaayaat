import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaUserPlus, FaSignInAlt, FaHome } from 'react-icons/fa';
import logo from '../assets/brandlogo.png'; // Adjust path if needed
import '../css/NavbarPublic.css';


const NavbarPublic = () => {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm py-2">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <img
            src={logo}
            alt="Rivaayat Logo"
            className="logo-img"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center gap-3">
            <Nav.Link as={Link} to="/" className="d-flex align-items-center gap-1">
              <FaHome /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/login" className="d-flex align-items-center gap-1">
              <FaSignInAlt /> Login
            </Nav.Link>
            <Nav.Link as={Link} to="/register" className="d-flex align-items-center gap-1">
              <FaUserPlus /> Register
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarPublic;