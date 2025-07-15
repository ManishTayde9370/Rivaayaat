// components/ActivityList.js
import React from 'react';
import '../css/Dashboard.css';

const ActivityList = ({ activities }) => {
  return (
    <ul className="list-group">
      {activities.length === 0 ? (
        <li className="list-group-item text-muted">No recent activity.</li>
      ) : (
        activities.map((act) => (
          <li key={act.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{act.action}</span>
            <small className="text-muted">{act.time}</small>
          </li>
        ))
      )}
    </ul>
  );
};

export default ActivityList;
