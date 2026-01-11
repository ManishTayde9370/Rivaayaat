import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { showNotification } from '../utils/notifications';

const API_BASE = '/api/admin/exports';

const ScheduledExportRunsModal = ({ scheduleId, onClose }) => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/${scheduleId}/runs`, { withCredentials: true });
      setRuns(res.data.runs || []);
    } catch (err) {
      showNotification.error('Failed to load runs');
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  useEffect(() => {
    if (scheduleId) fetchRuns();
  }, [scheduleId, fetchRuns]);

  const retry = async (runId) => {
    try {
      await axios.post(`${API_BASE}/runs/${runId}/retry`, {}, { withCredentials: true });
      showNotification.success('Retry started');
      fetchRuns();
    } catch (err) {
      showNotification.error('Failed to retry run');
    }
  };

  if (!scheduleId) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Export Runs</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {loading ? <div>Loading…</div> : (
              <table className="table table-sm">
                <thead><tr><th>Attempt</th><th>Status</th><th>Started</th><th>Finished</th><th>Error</th><th>Actions</th></tr></thead>
                <tbody>
                  {runs.map(r => (
                    <tr key={r._id}>
                      <td>{r.attempt}</td>
                      <td>{r.status}</td>
                      <td>{r.startedAt ? new Date(r.startedAt).toLocaleString() : '-'}</td>
                      <td>{r.finishedAt ? new Date(r.finishedAt).toLocaleString() : '-'}</td>
                      <td style={{maxWidth:300, overflow:'hidden', textOverflow:'ellipsis'}}>{r.errorMessage || ''}</td>
                      <td>
                        {r.status === 'failed' && <button className="btn btn-sm btn-outline-primary" onClick={()=>retry(r._id)}>Retry</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduledExportRunsModal;