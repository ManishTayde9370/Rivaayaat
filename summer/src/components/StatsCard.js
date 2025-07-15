// components/StatsCard.js
import React from 'react';
import CountUp from 'react-countup';
import '../css/Dashboard.css';

const StatsCard = ({ title, icon, count }) => {
  return (
    <div className="stats-card p-4 rounded text-center shadow-sm mx-2">
      <div className="stats-icon mb-2" style={{ fontSize: '2rem' }}>{icon}</div>
      <h6 className="text-uppercase text-muted mb-1">{title}</h6>
      <h3 className="stats-count text-dark fw-bold">
        <CountUp end={count} duration={1.5} />
      </h3>
    </div>
  );
};

export default StatsCard;
