import React from 'react';
import '../css/Timeline.css';

const Timeline = () => {
  return (
    <div className="timeline">
      <div className="timeline-item">
        <div className="timeline-content">
          <h5>2022</h5>
          <p>Conceptualized Rivaayat and started a small cultural blog.</p>
        </div>
      </div>
      <div className="timeline-item">
        <div className="timeline-content">
          <h5>2023</h5>
          <p>Launched affiliate marketplace and first storytelling feature.</p>
        </div>
      </div>
      <div className="timeline-item">
        <div className="timeline-content">
          <h5>2024</h5>
          <p>Integrated community features and artisan dashboards.</p>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
