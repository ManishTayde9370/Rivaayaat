import React from 'react';
import { useSelector } from 'react-redux';

const UserProfile = () => {
  const user = useSelector(state => state.user);

  return (
    <div className="container py-5">
      <h1 className="Rivaayaat-heading mb-4">My Profile</h1>
      <div className="Rivaayaat-card p-4" style={{ maxWidth: 600 }}>
        <div className="mb-3"><strong>Name:</strong> {user?.name || '—'}</div>
        <div className="mb-3"><strong>Username:</strong> {user?.username || '—'}</div>
        <div className="mb-3"><strong>Email:</strong> {user?.email || '—'}</div>
        <div className="mb-3"><strong>Phone:</strong> {user?.phone || '—'}</div>
      </div>
    </div>
  );
};

export default UserProfile;
