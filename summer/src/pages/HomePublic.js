import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaShoppingBag, FaHeart, FaStar, FaUsers, FaLeaf, FaGlobe,FaPlay } from "react-icons/fa";
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
  },
  {
    icon: <FaUsers />,
    title: "Support Artisans",
    description: "Empowering local craftsmen through fair trade practices"
  },
  {
    icon: <FaLeaf />,
    title: "Sustainable Materials",
    description: "Eco-friendly creations using natural and recycled resources"
  },
  {
    icon: <FaGlobe />,
    title: "Worldwide Shipping",
    description: "Delivering handcrafted treasures across the globe"
  }
];

  

  return (
    <div className="Rivaayaat-home">
      {/* 🏺 Hero Section */}
      <section
  className="Rivaayaat-hero"
  style={{
    backgroundImage: `linear-gradient(135deg, rgba(61,64,91,0.45), rgba(87,117,144,0.35)), url(${images[currentImage]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    imageRendering: 'crisp-edges',
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // horizontally center
    position: 'relative'
  }}
>
  <div className="Rivaayaat-hero-content text-center">
    <Container>
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="scroll-reveal">
            <h1 className="Rivaayaat-heading text-sand mb-4">
              Welcome to <span className="text-amber">Rivaayaat</span>
            </h1>
            <p className="playfair text-sand mb-4" style={{ fontSize: '1.2rem', lineHeight: 1.8 }}>
              Discover the beauty of Indian heritage through handcrafted treasures
            </p>
            <p className="inter text-sand mb-5" style={{ fontSize: '1rem', opacity: 0.9 }}>
              Step into a world where timeless traditions meet modern elegance. 
              Explore curated collections that tell stories of India's rich cultural heritage.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/login" className="Rivaayaat-btn">
                <FaPlay className="me-2" />
                Start Shopping
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
              <h2 className="Rivaayaat-heading text-earth">
                Why Choose Rivaayaat?
              </h2>
              <p className="Rivaayaat-subheading text-forest">
                Experience the finest handcrafted products with authentic cultural heritage
              </p>
            </Col>
          </Row>
          
          <Row className="Rivaayaat-grid g-4">
  {features.map((feature, index) => (
    <Col key={index} lg={4} md={6} sm={12}>
      <Card
        className="Rivaayaat-card h-100 text-center scroll-reveal shadow-sm border-0"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
          <div
            className="mb-3"
            style={{ fontSize: '2.5rem', color: 'var(--color-terracotta)' }}
          >
            {feature.icon}
          </div>
          <Card.Title
            className="cinzel text-earth mb-2"
            style={{ fontSize: '1.3rem' }}
          >
            {feature.title}
          </Card.Title>
          <Card.Text
            className="inter text-earth"
            style={{ fontSize: '1rem', lineHeight: 1.5 }}
          >
            {feature.description}
          </Card.Text>
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
              
              <Col lg={6} className="text-center mb-4 mb-lg-0">
  <div className="Rivaayaat-motif">
    <h3
      className="cinzel mb-4"
      style={{ color: '#000' }} // earthy brown
    >
      Our Story
    </h3>
    <p
      className="playfair mb-4"
      style={{
        fontSize: '1.1rem',
        lineHeight: 1.8,
        color: '#8B5E3C'
      }}
    >
      Rivaayaat celebrates India's rich heritage by connecting you with skilled artisans 
      and their timeless crafts. Every product tells a story of tradition, skill, and cultural pride.
    </p>
    <p
      className="inter"
      style={{
        opacity: 0.9,
        color: '#8B5E3C'
      }}
    >
      From intricate weaves to vibrant pottery, discover the artistry that makes India truly extraordinary.
    </p>
  </div>
</Col>

              <Col lg={6}>
  <div className="Rivaayaat-card1 bg-cream" style={{ color: '#000' }}>
    <h4 className="cinzel mb-3">
      Our Promise
    </h4>
    <ul className="list-unstyled">
      <li className="mb-3 d-flex align-items-center">
        <span className="Rivaayaat-badge me-3">🕉️</span>
        <span className="inter">Authentic handcrafted products</span>
      </li>
      <li className="mb-3 d-flex align-items-center">
        <span className="Rivaayaat-badge me-3">🎨</span>
        <span className="inter">Direct support to artisans</span>
      </li>
      <li className="mb-3 d-flex align-items-center">
        <span className="Rivaayaat-badge me-3">📖</span>
        <span className="inter">Cultural stories and heritage</span>
      </li>
      <li className="mb-3 d-flex align-items-center">
        <span className="Rivaayaat-badge me-3">🌟</span>
        <span className="inter">Quality and craftsmanship</span>
      </li>
    </ul>
  </div>
</Col>

          </Row>
        </Container>
      </section>

      {/* 🎪 Call to Action Section (no browse products for public) */}
      <section className="py-5 bg-ivory">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <div className="Rivaayaat-motif">
                                  <h3 className="cinzel text-earth mb-4">
                    Ready to Explore?
                  </h3>
                  <p className="playfair text-forest mb-4" style={{ fontSize: '1.1rem' }}>
                    Join our community and discover the beauty of Indian heritage through handcrafted treasures.
                  </p>
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Link to="/register" className="Rivaayaat-btn">
                    Create Account
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