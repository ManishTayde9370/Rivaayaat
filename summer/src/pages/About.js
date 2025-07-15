import React from 'react';      
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/About.css'; // Optional for styles

const About = () => {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 about-title">About Rivaayat</h2>
      <p className="lead text-center about-subtitle text-muted">
        Bridging timeless traditions with tomorrow's technology.
      </p>

      {/* Brand Story */}
      <section className="mt-5">
        <h4 className="section-heading">📖 Our Brand Story</h4>
        <p className="section-text">
          The name “Rivaayat” is derived from the Urdu word for "tradition" — a fitting name for a platform born from a love for our rich cultural heritage.
          Rivaayat was founded with a vision to bring together artisans, storytellers, and enthusiasts on a single platform where culture meets commerce and community.
        </p>
      </section>

      {/* Mission and Vision */}
      <section className="row mt-5">
        <div className="col-md-6">
          <h4 className="section-heading">🎯 Our Mission</h4>
          <p className="section-text">
            To preserve, promote, and pass on the richness of traditional Indian art, attire, and stories by enabling creators and curators through digital tools.
          </p>
        </div>
        <div className="col-md-6">
          <h4 className="section-heading">👁️ Our Vision</h4>
          <p className="section-text">
            A world where heritage is not just remembered but lived every day, through fashion, stories, and community-led initiatives.
          </p>
        </div>
      </section>

      {/* What We Offer */}
      <section className="mt-5">
        <h4 className="section-heading">💡 What We Offer</h4>
        <ul className="list-unstyled section-text ps-3">
          <li>🛍️ A curated affiliate marketplace for ethnic & traditional products</li>
          <li>🧵 Platforms for local artisans to sell and tell their story</li>
          <li>📚 Articles, blogs, and documentaries on culture & crafts</li>
          <li>📊 Personalized dashboards for shoppers and sellers</li>
          <li>🔐 Secure authentication including Google login</li>
          <li>📦 Reliable customer support and seamless order tracking</li>
        </ul>
      </section>

      {/* Our Values */}
      <section className="mt-5">
        <h4 className="section-heading">🌿 Our Core Values</h4>
        <ul className="list-unstyled section-text ps-3">
          <li>🧡 Authenticity — We stay true to the roots of culture</li>
          <li>🌍 Inclusivity — Open to all communities and creators</li>
          <li>🚀 Innovation — Tradition meets modern design and tech</li>
          <li>🤝 Empowerment — Supporting small businesses & artisans</li>
        </ul>
      </section>

      {/* Why Choose Us */}
      <section className="mt-5">
        <h4 className="section-heading">✨ Why Choose Rivaayat?</h4>
        <p className="section-text">
          With Rivaayat, you’re not just buying a product — you’re supporting a legacy, contributing to artisan livelihoods, and reviving stories worth telling.
          From traditional clothing to unique handcrafted goods, every item comes with cultural richness and ethical sourcing.
        </p>
      </section>

      {/* Team */}
      <section className="mt-5">
        <h4 className="section-heading">👨‍👩‍👧‍👦 Meet the Team</h4>
        <p className="section-text">
          We're a passionate group of designers, technologists, and storytellers who believe in the power of cultural continuity through modern means.
          Our team is spread across cities, united by one goal — to make heritage timeless.
        </p>
      </section>

      
    </div>
  );
};

export default About;
