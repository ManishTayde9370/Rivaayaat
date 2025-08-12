import React from 'react';

const faqs = [
  { q: 'How do I track my order?', a: 'Go to Track Order in Support or Dashboard > Recent Orders. You will see your recent orders and their status.' },
  { q: 'What payment methods are supported?', a: 'We support Razorpay with UPI, cards, net banking, and popular wallets in India.' },
  { q: 'How long does delivery take?', a: 'Orders are typically delivered within 5-7 business days. You will receive updates by email.' },
  { q: 'What is your return policy?', a: 'You can initiate returns within 7 days for eligible products. See the Return & Refund Policy page for details.' },
  { q: 'Do you ship internationally?', a: 'Currently we ship within India only.' },
  { q: 'How do I contact support?', a: 'Use the Contact page to send us a message. We will respond within 24-48 hours.' },
  { q: 'How are reviews moderated?', a: 'Reviews require an account and are tied to your user. Inappropriate content may be removed.' },
  { q: 'Are products authentic and handmade?', a: 'Yes. We partner directly with artisans; details appear in product pages.' }
];

const FAQs = () => {
  return (
    <div className="container py-5">
      <h1 className="rivaayat-heading mb-4">FAQs</h1>
      <div className="accordion" id="faqAccordion">
        {faqs.map((item, idx) => (
          <div className="accordion-item" key={idx}>
            <h2 className="accordion-header" id={`heading-${idx}`}>
              <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${idx}`} aria-expanded={idx===0} aria-controls={`collapse-${idx}`}>
                {item.q}
              </button>
            </h2>
            <div id={`collapse-${idx}`} className={`accordion-collapse collapse ${idx===0 ? 'show' : ''}`} data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                {item.a}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
