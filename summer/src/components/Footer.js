import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import '../css/theme.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="Rivaayaat-footer">
      <Container>
        <Row className="mb-4">
          <Col lg={4} className="mb-4">
            <div className="text-center text-lg-start">
                              <h4 className="cinzel text-amber mb-3">
                  🕉️ Rivaayaat
                </h4>
                <p className="playfair text-sand mb-4" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                  Celebrating India's rich heritage through handcrafted treasures and authentic cultural experiences.
                </p>
              <div className="d-flex justify-content-center justify-content-lg-start gap-3">
                <button aria-label="Facebook" className="Rivaayaat-badge Rivaayaat-badge-maroon">
                  <FaFacebookF />
                </button>
                <button aria-label="Twitter" className="Rivaayaat-badge Rivaayaat-badge-maroon">
                  <FaTwitter />
                </button>
                <button aria-label="Instagram" className="Rivaayaat-badge Rivaayaat-badge-maroon">
                  <FaInstagram />
                </button>
                <button aria-label="YouTube" className="Rivaayaat-badge Rivaayaat-badge-maroon">
                  <FaYoutube />
                </button>
              </div>
            </div>
          </Col>
          
          <Col lg={2} md={6} className="mb-4">
            <h6 className="cinzel text-amber mb-3">Shop</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/product" className="text-sand text-decoration-none inter">
                  All Products
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/product?category=textiles" className="text-sand text-decoration-none inter">
                  Textiles
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/product?category=pottery" className="text-sand text-decoration-none inter">
                  Pottery
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/product?category=jewelry" className="text-sand text-decoration-none inter">
                  Jewelry
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={2} md={6} className="mb-4">
            <h6 className="cinzel text-amber mb-3">Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/contact" className="text-sand text-decoration-none inter">
                  Contact Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/track-order" className="text-sand text-decoration-none inter">
                  Track Order
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/shipping-details" className="text-sand text-decoration-none inter">
                  Shipping
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/return-refund-policy" className="text-sand text-decoration-none inter">
                  Returns
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={2} md={6} className="mb-4">
            <h6 className="cinzel text-amber mb-3">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/about" className="text-sand text-decoration-none inter">
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/terms-of-use" className="text-sand text-decoration-none inter">
                  Terms
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy-policy" className="text-sand text-decoration-none inter">
                  Privacy
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/faqs" className="text-sand text-decoration-none inter">
                  FAQs
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={2} md={6} className="mb-4">
            <h6 className="cinzel text-amber mb-3">Newsletter</h6>
            <p className="inter text-sand small mb-3">
              Stay updated with our latest products and cultural stories.
            </p>
            <Form className="d-flex flex-column gap-2">
              <Form.Control 
                type="email" 
                placeholder="Your email" 
                className="Rivaayaat-input"
                size="sm"
              />
              <Button className="Rivaayaat-btn btn-sm">
                Subscribe
              </Button>
            </Form>
          </Col>
        </Row>
        
        <hr className="border-sand" />
        
        {/* Copyright Section */}
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start">
            <p className="inter text-sand mb-0">
              © 2025 Rivaayaat. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="inter text-sand mb-0">
              care@Rivaayaat.com | 10am - 7pm, Monday - Saturday
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
