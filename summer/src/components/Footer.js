import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPinterest } from 'react-icons/fa';
import '../css/Footer.css';

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
                  <li>Track Order</li>
                  <li>Contact Us</li>
                  <li>My Account</li>
                </ul>
              </Col>
              <Col md={3}>
                <h6 className="footer-heading">QUICK LINKS</h6>
                <ul className="footer-links">
                  <li>About Us</li>
                  <li>Brand Story</li>
                  <li>Blogs</li>
                  <li>Careers</li>
                  <li>Store Locator</li>
                </ul>
              </Col>
              <Col md={3}>
                <h6 className="footer-heading">OUR POLICIES</h6>
                <ul className="footer-links">
                  <li>FAQs</li>
                  <li>Shipping Details</li>
                  <li>Return & Refund Policy</li>
                  <li>Terms of Use</li>
                  <li>Privacy Policy</li>
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
