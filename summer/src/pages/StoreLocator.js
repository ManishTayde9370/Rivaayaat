import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const StoreLocator = () => {
  const userDetails = useSelector(state => state.user);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/stores')
      .then(res => setStores(res.data.stores || []))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-5">
      <h1 className="mb-4 rivaayat-heading">Store Locator</h1>
      {userDetails?.name && <p className="mb-4">Welcome, {userDetails.name}! Find a Rivaayat store near you.</p>}
      <div className="mb-4" style={{ width: '100%', height: 300, background: '#fff8f0', borderRadius: 12, border: '1.5px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)', fontWeight: 500 }}>
        [Map Placeholder]
      </div>
      <h4 className="rivaayat-heading" style={{ fontSize: '1.3em' }}>Our Stores</h4>
      {loading ? <div>Loading...</div> : (
        <ul className="list-group">
          {stores.length === 0 ? <li className="list-group-item">No stores found.</li> : stores.map((store, i) => (
            <li className="list-group-item" key={i} style={{ borderRadius: 8, background: '#fff8f0', border: '1.5px solid var(--border-color)', marginBottom: 8 }}>
              <strong>{store.name}</strong><br />
              <span>{store.address}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StoreLocator; 