import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaPlay, FaShoppingBag, FaHeart, FaStar } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import bgImage from '../assets/hero-image.jpg';
import '../css/theme.css';

const HomePublic = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [bgImage];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const features = [
    {
      icon: <FaShoppingBag />,
      title: "Handcrafted Products",
      description: "Discover unique items made by skilled artisans"
    },
    {
      icon: <FaHeart />,
      title: "Cultural Heritage",
      description: "Celebrate India's rich traditions and crafts"
    },
    {
      icon: <FaStar />,
      title: "Quality Assured",
      description: "Premium products with authentic craftsmanship"
    }
  ];

  return (
    <div className="rivaayat-home">
      {/* 🏺 Hero Section */}
      <section 
        className="rivaayat-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(61, 64, 91, 0.8), rgba(87, 117, 144, 0.7)), url(${images[currentImage]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <div className="rivaayat-hero-content">
          <Container>
            <Row className="justify-content-center text-center">
              <Col lg={8}>
                <div className="scroll-reveal">
                  <h1 className="rivaayat-heading text-sand mb-4">
                    Welcome to <span className="text-amber">Rivaayat</span>
                  </h1>
                  <p className="playfair text-sand mb-4" style={{ fontSize: '1.2rem', lineHeight: 1.8 }}>
                    Discover the beauty of Indian heritage through handcrafted treasures
                  </p>
                  <p className="inter text-sand mb-5" style={{ fontSize: '1rem', opacity: 0.9 }}>
                    Step into a world where timeless traditions meet modern elegance. 
                    Explore curated collections that tell stories of India's rich cultural heritage.
                  </p>
                  
                  <div className="d-flex flex-wrap justify-content-center gap-3">
                    <Link to="/login" className="rivaayat-btn">
                      <FaPlay className="me-2" />
                      Start Shopping
                    </Link>
                    <Link to="/register" className="rivaayat-btn rivaayat-btn-outline">
                      Join Community
                    </Link>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* 🎨 Features Section */}
      <section className="py-5 bg-ivory">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="rivaayat-heading text-earth">
                Why Choose Rivaayat?
              </h2>
              <p className="rivaayat-subheading text-forest">
                Experience the finest handcrafted products with authentic cultural heritage
              </p>
            </Col>
          </Row>
          
          <Row className="rivaayat-grid">
            {features.map((feature, index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <Card className="rivaayat-card h-100 text-center scroll-reveal" 
                      style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <div>
                      <div className="mb-3" style={{ fontSize: '2.5rem', color: 'var(--color-terracotta)' }}>
                        {feature.icon}
                      </div>
                      <Card.Title className="cinzel text-earth mb-3" style={{ fontSize: '1.3rem' }}>
                        {feature.title}
                      </Card.Title>
                      <Card.Text className="inter text-earth">
                        {feature.description}
                      </Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* 🕉️ Story Section */}
      <section className="py-5"         style={{ background: 'linear-gradient(135deg, var(--color-earth), var(--color-forest))' }}>
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="text-center text-sand mb-4 mb-lg-0">
                <div className="rivaayat-motif">
                  <h3 className="cinzel text-sand mb-4">
                    Our Story
                  </h3>
                  <p className="playfair text-sand mb-4" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                    Rivaayat celebrates India's rich heritage by connecting you with skilled artisans 
                    and their timeless crafts. Every product tells a story of tradition, skill, and cultural pride.
                  </p>
                  <p className="inter text-sand" style={{ opacity: 0.9 }}>
                    From intricate weaves to vibrant pottery, discover the artistry that makes India truly extraordinary.
                  </p>
                </div>
              </Col>
              <Col lg={6}>
                <div className="rivaayat-card bg-cream">
                  <h4 className="cinzel text-earth mb-3">
                    Our Promise
                  </h4>
                <ul className="list-unstyled">
                  <li className="mb-3 d-flex align-items-center">
                    <span className="rivaayat-badge me-3">🕉️</span>
                    <span className="inter">Authentic handcrafted products</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <span className="rivaayat-badge me-3">🎨</span>
                    <span className="inter">Direct support to artisans</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <span className="rivaayat-badge me-3">📖</span>
                    <span className="inter">Cultural stories and heritage</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <span className="rivaayat-badge me-3">🌟</span>
                    <span className="inter">Quality and craftsmanship</span>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 🎪 Call to Action Section */}
      <section className="py-5 bg-ivory">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <div className="rivaayat-motif">
                                  <h3 className="cinzel text-earth mb-4">
                    Ready to Explore?
                  </h3>
                  <p className="playfair text-forest mb-4" style={{ fontSize: '1.1rem' }}>
                    Join our community and discover the beauty of Indian heritage through handcrafted treasures.
                  </p>
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Link to="/register" className="rivaayat-btn">
                    Create Account
                  </Link>
                  <Link to="/product" className="rivaayat-btn rivaayat-btn-outline">
                    Browse Products
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default HomePublic;