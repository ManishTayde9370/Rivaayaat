import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPinterest } from 'react-icons/fa';
import '../css/Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer text-light py-5">
      <Container>
        <Row className="mb-4">
          <Col md={8}>
            <Row>
              <Col md={3}>
                <h6 className="footer-heading">CATEGORIES</h6>
                <ul className="footer-links">
                  <li>Kurta Pajama</li>
                  <li>Kurta Jacket Sets</li>
                  <li>Only Kurtas</li>
                  <li>Nehru Jackets</li>
                  <li>Indo Western</li>
                  <li>Sherwani</li>
                </ul>
              </Col>
              <Col md={3}>
                <h6 className="footer-heading">SUPPORT</h6>
                <ul className="footer-links">
                  <li><Link to="/track-order">Track Order</Link></li>
                  <li><Link to="/contact">Contact Us</Link></li>
                  <li><Link to="/dashboard">My Account</Link></li>
                </ul>
              </Col>
              <Col md={3}>
                <h6 className="footer-heading">QUICK LINKS</h6>
                <ul className="footer-links">
                  <li><Link to="/about">About Us</Link></li>
                  <li><Link to="/brand-story">Brand Story</Link></li>
                  <li><Link to="/blogs">Blogs</Link></li>
                  <li><Link to="/careers">Careers</Link></li>
                  <li><Link to="/store-locator">Store Locator</Link></li>
                </ul>
              </Col>
              <Col md={3}>
                <h6 className="footer-heading">OUR POLICIES</h6>
                <ul className="footer-links">
                  <li><Link to="/faqs">FAQs</Link></li>
                  <li><Link to="/shipping-details">Shipping Details</Link></li>
                  <li><Link to="/return-refund-policy">Return & Refund Policy</Link></li>
                  <li><Link to="/terms-of-use">Terms of Use</Link></li>
                  <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                </ul>
              </Col>
            </Row>
          </Col>

          <Col md={4}>
            <h6 className="footer-heading">Subscribe to our Newsletter</h6>
            <Form className="d-flex mb-3">
              <Form.Control type="email" placeholder="Email Address" className="me-2" />
              <Button variant="outline-light">→</Button>
            </Form>

            <h6 className="footer-heading mt-4">KEEP IN TOUCH</h6>
            <div className="social-icons">
              <FaFacebookF />
              <FaTwitter />
              <FaInstagram />
              <FaYoutube />
              <FaPinterest />
            </div>
            <p className="mt-3 small">care@rivaayaat.com<br />10am - 7pm, Monday - Saturday</p>
          </Col>
        </Row>

        <hr className="footer-divider" />
        <p className="text-center small mb-0">© 2025 - Rivaayaat. All rights reserved.</p>
      </Container>
    </footer>
  );
};

export default Footer;
