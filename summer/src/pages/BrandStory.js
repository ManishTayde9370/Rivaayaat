import React from 'react';

const BrandStory = () => (
  <div className="container py-5">
    <h1 className="mb-4">Our Brand Story</h1>
    <h4>Founder's Message</h4>
    <blockquote className="blockquote">
      <p>“Rivaayat is a tribute to the timeless beauty of Indian tradition. Our journey is about connecting artisans and customers, and keeping heritage alive in every home.”</p>
      <footer className="blockquote-footer">Manish Sharma, Founder</footer>
    </blockquote>
    <h4 className="mt-5">Our Journey</h4>
    <ul className="timeline list-unstyled">
      <li><strong>2018:</strong> Rivaayat founded in Mumbai with a vision to celebrate Indian crafts.</li>
      <li><strong>2019:</strong> First collection launched, partnering with 20+ artisans.</li>
      <li><strong>2021:</strong> Expanded to home decor and jewelry, 100+ artisans onboarded.</li>
      <li><strong>2023:</strong> Launched global shipping and artisan stories blog.</li>
      <li><strong>2024:</strong> Community of 10,000+ happy customers and growing!</li>
    </ul>
  </div>
);

export default BrandStory; 