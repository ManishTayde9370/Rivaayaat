import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../css/About.css";

const About = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="about-container">
      <div className="about-hero" data-aos="fade-down">
        <h1 className="about-title">Our Story</h1>
        <p className="about-subtitle">
          Celebrating Traditions, Embracing Modernity
        </p>
      </div>
      <div className="about-content">
        <section className="about-section" data-aos="fade-up">
          <h2>Brand Journey</h2>
          <p>
            Our journey began with a vision to redefine celebration wear, blending timeless traditions with contemporary style. What started as a small family initiative has blossomed into a thriving brand, cherished by thousands for its commitment to quality, elegance, and authenticity.
          </p>
        </section>
        <section className="about-section" data-aos="fade-up" data-aos-delay="100">
          <h2>Signature Collection</h2>
          <p>
            From exquisite sherwanis and royal bandhgalas to elegant sarees and festive lehengas, our collection is a one-stop destination for all your special moments. Each piece is crafted with care, reflecting the rich heritage and vibrant spirit of Indian celebrations.
          </p>
        </section>
        <section className="about-section" data-aos="fade-up" data-aos-delay="200">
          <h2>Our Growth</h2>
          <p>
            Over the years, we have grown from a passionate team of a few to a dedicated family of many, expanding our presence across cities and countries. Our commitment to quality and customer delight has helped us earn the trust of a global clientele.
          </p>
        </section>
        <section className="about-section" data-aos="fade-up" data-aos-delay="300">
          <h2>Our Ethos</h2>
          <p>
            We believe in empowering artisans, ensuring assured quality, and delivering joy with every outfit. Our brand stands for authenticity, inclusivity, and the celebration of every unique story.
          </p>
        </section>
        <section className="about-section" data-aos="fade-up" data-aos-delay="400">
          <h2>Celebrating You</h2>
          <p>
            Whether it’s a wedding, festival, or a new beginning, we are honored to be a part of your cherished moments. Dress your best, celebrate your identity, and create memories that last a lifetime—because every occasion deserves to be extraordinary.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
