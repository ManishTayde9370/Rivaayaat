import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { serverEndpoint } from './config';

const API = serverEndpoint;

const Recommendations = ({ productId, limit = 6 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/products/${productId}/related?limit=${limit}`);
        setItems(res.data.related || []);
      } catch (err) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [productId, limit]);

  if (loading) return <div className="text-center my-3">Loading recommendations...</div>;
  if (!items || items.length === 0) return null;

  return (
    <div className="recommendations">
      <h4 className="mb-3">You may also like</h4>
      <div className="d-flex gap-3 flex-wrap">
        {items.map((p) => (
          <div key={p._id} className="card" style={{ width: 160 }}>
            <Link to={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src={p.images?.[0] || ''} alt={p.name} className="card-img-top" style={{ height: 110, objectFit: 'cover' }} />
              <div className="card-body p-2">
                <div className="small fw-semibold" style={{ minHeight: 36 }}>{p.name}</div>
                <div className="text-muted">₹{p.price}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
