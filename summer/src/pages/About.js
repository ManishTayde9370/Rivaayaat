import React from 'react';

const About = () => (
  <div className="container py-5">
    <h1 className="mb-4">About Us</h1>
    <h4>Our Mission</h4>
    <p>To celebrate Indian heritage by curating and delivering authentic, handcrafted products that connect tradition with today.</p>
    <h4>Our Vision</h4>
    <p>To be the most trusted platform for Indian artisans and customers, preserving culture and empowering communities.</p>
    <h4>Meet the Team</h4>
    <div className="row">
      <div className="col-md-4 mb-3">
        <div className="p-3 border rounded bg-light text-center">
          <img src="/uploads/products/saree1-front.jpg" alt="Founder" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 10 }} />
          <h6>Manish Sharma</h6>
          <p className="text-muted">Founder & CEO</p>
        </div>
      </div>
      <div className="col-md-4 mb-3">
        <div className="p-3 border rounded bg-light text-center">
          <img src="/uploads/products/lamp1.jpg" alt="Co-Founder" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 10 }} />
          <h6>Priya Verma</h6>
          <p className="text-muted">Co-Founder & COO</p>
        </div>
      </div>
      <div className="col-md-4 mb-3">
        <div className="p-3 border rounded bg-light text-center">
          <img src="/uploads/products/woodbox1.jpg" alt="Head of Design" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 10 }} />
          <h6>Ravi Patel</h6>
          <p className="text-muted">Head of Design</p>
        </div>
      </div>
    </div>
  </div>
);

export default About;
