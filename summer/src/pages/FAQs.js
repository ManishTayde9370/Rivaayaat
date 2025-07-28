import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const FAQs = () => {
  const userDetails = useSelector(state => state.user);
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [userQuestions, setUserQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/faqs')
      .then(res => setFaqs(res.data.faqs || []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
    if (userDetails?._id) {
      axios.get(`/api/faqs/user?userId=${userDetails._id}`)
        .then(res => setUserQuestions(res.data.questions || []))
        .catch(() => setUserQuestions([]));
    }
  }, [userDetails]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!userDetails?._id) return;
    await axios.post('/api/faqs/ask', { userId: userDetails._id, question });
    setSubmitted(true);
    setQuestion('');
    // Refresh user questions
    const res = await axios.get(`/api/faqs/user?userId=${userDetails._id}`);
    setUserQuestions(res.data.questions || []);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4 rivaayat-heading">Frequently Asked Questions (FAQs)</h1>
      {userDetails?.name && <p className="mb-4">Hi {userDetails.name}, need help? Check below or ask your own question.</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: 500 }} className="mb-4">
        <div className="input-group">
          <input type="text" className="form-control" placeholder="Ask a question..." value={question} onChange={e => setQuestion(e.target.value)} required />
          <button className="rivaayat-btn" type="submit">Submit</button>
        </div>
        {submitted && <div className="alert alert-success mt-2">Thank you! We'll answer your question soon.</div>}
      </form>
      {userQuestions.length > 0 && (
        <div className="mb-4" style={{ maxWidth: 500 }}>
          <h5>Your Questions</h5>
          <ul className="list-group">
            {userQuestions.map((q, i) => (
              <li className="list-group-item" key={i}>{q.question}</li>
            ))}
          </ul>
        </div>
      )}
      {loading ? <div>Loading...</div> : (
        <div className="accordion" id="faqAccordion">
          {faqs.map((faq, i) => (
            <div className="accordion-item" key={i} style={{ borderRadius: 10, background: '#fff8f0', border: '1.5px solid var(--border-color)', marginBottom: 10 }}>
              <h2 className="accordion-header" id={`heading${i}`}>
                <button
                  className={`accordion-button${open === i ? '' : ' collapsed'}`}
                  type="button"
                  aria-expanded={open === i}
                  aria-controls={`collapse${i}`}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {faq.q || faq.question}
                </button>
              </h2>
              <div
                id={`collapse${i}`}
                className={`accordion-collapse collapse${open === i ? ' show' : ''}`}
                aria-labelledby={`heading${i}`}
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">{faq.a || faq.answer || 'Our team will answer this soon.'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQs; 