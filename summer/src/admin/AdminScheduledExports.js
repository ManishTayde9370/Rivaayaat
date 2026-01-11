import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import { showNotification } from '../utils/notifications';
import ScheduledExportRunsModal from './ScheduledExportRunsModal';

const API = `${serverEndpoint}/api/admin/exports`;

const AdminScheduledExports = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', cron: '0 0 * * *', destination: 'email', emails: '', s3: { bucket: '', prefix: '' }, retry: { enabled: false, maxAttempts: 3, backoffSeconds: 60 } });
  const [viewRunsFor, setViewRunsFor] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const res = await axios.get(API, { withCredentials: true }); setSchedules(res.data.schedules || []); }
    catch (err) { showNotification.error('Failed to load schedules'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) { return <div className="admin-card">Loading…</div>; }

  const create = async () => {
    try {
      const payload = { ...form, emails: form.emails ? form.emails.split(',').map(e => e.trim()) : [] };
      await axios.post(API, payload, { withCredentials: true });
      showNotification.success('Schedule created');
      setForm({ name: '', cron: '0 0 * * *', destination: 'email', emails: '', s3: { bucket: '', prefix: '' } });
      fetch();
    } catch (err) { showNotification.error('Failed to create schedule'); }
  };

  const remove = async (id) => { try { await axios.delete(`${API}/${id}`, { withCredentials: true }); showNotification.info('Schedule removed'); fetch(); } catch (err) { showNotification.error('Failed to remove schedule'); } };

  const trigger = async (id) => { try { await axios.post(`${API}/trigger/${id}`, {}, { withCredentials: true }); showNotification.success('Triggered'); } catch (err) { showNotification.error('Failed to trigger'); } };

  return (
    <div className="admin-card">
      <h2>Scheduled Exports</h2>
      <div className="mb-3">
        <input className="form-control mb-2" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
        <input className="form-control mb-2" placeholder="Cron (e.g. 0 0 * * *)" value={form.cron} onChange={(e)=>setForm({...form, cron: e.target.value})} />
        <select className="form-select mb-2" value={form.destination} onChange={(e)=>setForm({...form, destination: e.target.value})}>
          <option value="email">Email</option>
          <option value="s3">S3</option>
        </select>
        {form.destination === 'email' && (
          <input className="form-control mb-2" placeholder="Comma-separated emails" value={form.emails} onChange={(e)=>setForm({...form, emails: e.target.value})} />
        )}
        {form.destination === 's3' && (
          <>
            <input className="form-control mb-2" placeholder="S3 Bucket" value={form.s3.bucket} onChange={(e)=>setForm({...form, s3: {...form.s3, bucket: e.target.value}})} />
            <input className="form-control mb-2" placeholder="S3 Prefix (optional)" value={form.s3.prefix} onChange={(e)=>setForm({...form, s3: {...form.s3, prefix: e.target.value}})} />
          </>
        )}

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" id="retryEnabled" checked={form.retry.enabled} onChange={(e)=>setForm({...form, retry: {...form.retry, enabled: e.target.checked}})} />
          <label className="form-check-label" htmlFor="retryEnabled">Enable retry on failure</label>
        </div>
        {form.retry.enabled && (
          <div className="mb-2">
            <input type="number" className="form-control mb-1" placeholder="Max attempts (e.g. 3)" value={form.retry.maxAttempts} onChange={(e)=>setForm({...form, retry: {...form.retry, maxAttempts: parseInt(e.target.value||'1',10)}})} />
            <input type="number" className="form-control" placeholder="Backoff seconds (e.g. 60)" value={form.retry.backoffSeconds} onChange={(e)=>setForm({...form, retry: {...form.retry, backoffSeconds: parseInt(e.target.value||'60',10)}})} />
          </div>
        )}

        <button className="btn btn-primary" onClick={create}>Create Schedule</button>
      </div>

      <h4>Existing Schedules</h4>
      <table className="table table-sm">
        <thead><tr><th>Name</th><th>Cron</th><th>Dest</th><th>Last Run</th><th>Actions</th></tr></thead>
        <tbody>
          {schedules.map(s => (
            <tr key={s._id}><td>{s.name}</td><td>{s.cron}</td><td>{s.destination}</td><td>{s.lastRunAt ? new Date(s.lastRunAt).toLocaleString() : '-'}</td><td>
              <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>trigger(s._id)}>Run now</button>
              <button className="btn btn-sm btn-outline-secondary me-2" onClick={()=>setViewRunsFor(s._id)}>View runs</button>
              <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(s._id)}>Delete</button>
            </td></tr>
          ))}
        </tbody>
      </table>

      {viewRunsFor && <ScheduledExportRunsModal scheduleId={viewRunsFor} onClose={()=>setViewRunsFor(null)} />}
    </div>
  );
};

export default AdminScheduledExports;