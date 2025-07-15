import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import '../css/StatsCard.css'; // Optional: for custom styles

const StatsCard = ({ title, icon, count }) => {
  const props = useSpring({
    from: { number: 0 },
    to: { number: count },
    config: { duration: 800 },
  });

  return (
    <div className="stats-card shadow rounded-2xl p-3 bg-light text-center h-100">
      <div className="stat-icon fs-2 mb-2">{icon}</div>
      <h5 className="stat-title mb-1">{title}</h5>
      <animated.h3 className="stat-count fw-bold">
        {props.number.to((n) => Math.floor(n))}
      </animated.h3>
    </div>
  );
};

export default StatsCard;
