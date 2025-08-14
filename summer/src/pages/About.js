import React from 'react';
import '../css/theme.css';

const timeline = [
  { year: '2018', event: 'Rivaayaat founded to revive India’s royal crafts.' },
  { year: '2019', event: 'First artisan partnership in Varanasi.' },
  { year: '2020', event: 'Launched “Festive Hampers” for Diwali.' },
  { year: '2022', event: 'Reached 10,000+ happy customers.' },
  { year: '2023', event: 'Featured in “Handmade in India” showcase.' },
];

const team = [
  {
    name: 'Manish Sharma',
    role: 'Founder & CEO',
    img: '/uploads/products/saree1-front.jpg',
  },
  {
    name: 'Priya Verma',
    role: 'Co-Founder & COO',
    img: '/uploads/products/lamp1.jpg',
  },
  {
    name: 'Ravi Patel',
    role: 'Head of Design',
    img: '/uploads/products/woodbox1.jpg',
  },
];

const About = () => (
  <div className="container py-5">
    <div className="miniature-border p-4 scroll-dropdown" style={{ background: 'var(--color-ivory)' }}>
      <h1 className="cinzel mb-3 text-center" style={{ color: 'var(--color-maroon)' }}>
        About Us <span className="urdu-logo" style={{ fontSize: '1.3rem', marginLeft: 8 }}>ہمارے بارے میں</span>
      </h1>
      <h4 className="cinzel" style={{ color: 'var(--color-gold)' }}>Our Mission</h4>
      <p style={{ color: 'var(--color-black)' }}>
        To celebrate Indian heritage by curating and delivering authentic, handcrafted products that connect tradition with today.
      </p>
      <h4 className="cinzel" style={{ color: 'var(--color-gold)' }}>Our Vision</h4>
      <p style={{ color: 'var(--color-black)' }}>
        To be the most trusted platform for Indian artisans and customers, preserving culture and empowering communities.
      </p>
      <h4 className="cinzel mt-4" style={{ color: 'var(--color-peacock)' }}>Our Journey</h4>
      <div className="timeline mb-4">
        {timeline.map((item, idx) => (
          <div key={idx} className="d-flex align-items-center mb-2">
            <div className="cinzel" style={{ color: 'var(--color-gold)', minWidth: 70 }}>{item.year}</div>
            <div style={{ color: 'var(--color-black)', marginLeft: 12 }}>{item.event}</div>
          </div>
        ))}
      </div>
      <h4 className="cinzel mt-4" style={{ color: 'var(--color-maroon)' }}>Meet the Team</h4>
      <div className="row mt-3">
        {team.map((member, idx) => (
          <div className="col-md-4 mb-3" key={idx}>
            <div className="miniature-border p-3 bg-light text-center" style={{ background: 'var(--color-ivory)' }}>
              <img src={member.img} alt={member.name} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 10, border: '3px solid var(--color-gold)' }} />
              <h6 className="cinzel" style={{ color: 'var(--color-peacock)' }}>{member.name}</h6>
              <p className="text-muted" style={{ color: 'var(--color-maroon)' }}>{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default About;
