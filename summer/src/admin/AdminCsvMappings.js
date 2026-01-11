import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import { showNotification } from '../utils/notifications';

const API = `${serverEndpoint}/api/admin/csv`;

const AdminCsvMappings = () => {
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState('');
  const [mappingJson, setMappingJson] = useState('{}');
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/templates`, { withCredentials: true });
      setTemplates(res.data.templates || []);
    } catch (err) {
      showNotification.error('Failed to load templates');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const [editingId, setEditingId] = useState(null);

  const saveTemplate = async () => {
    try {
      const mapping = JSON.parse(mappingJson);
      if (editingId) {
        await axios.put(`${API}/templates/${editingId}`, { name, mapping }, { withCredentials: true });
        showNotification.success('Template updated');
        setEditingId(null);
      } else {
        await axios.post(`${API}/templates`, { name, mapping }, { withCredentials: true });
        showNotification.success('Template saved');
      }
      setName(''); setMappingJson('{}'); fetch();
    } catch (err) { showNotification.error('Failed to save template'); }
  };

  const remove = async (id) => {
    try { await axios.delete(`${API}/templates/${id}`, { withCredentials: true }); showNotification.info('Template removed'); fetch(); }
    catch (err) { showNotification.error('Failed to remove template'); }
  };

  const edit = (tpl) => { setEditingId(tpl._id); setName(tpl.name); setMappingJson(JSON.stringify(tpl.mapping, null, 2)); };
  const copyMapping = async (tpl) => { await navigator.clipboard.writeText(JSON.stringify(tpl.mapping)); showNotification.success('Mapping copied to clipboard'); };

  return (
    <div className="admin-card">
      <h2>CSV Mapping Templates</h2>
      <p className="text-muted">Create and store CSV column → product field mappings for reuse (JSON format mapping object).</p>
      <div className="mb-3">
        <input className="form-control mb-2" placeholder="Template name" value={name} onChange={(e)=>setName(e.target.value)} />
        <textarea className="form-control mb-2" rows={6} value={mappingJson} onChange={(e)=>setMappingJson(e.target.value)} />
        <button className="btn btn-primary" onClick={saveTemplate}>{editingId ? 'Update Template' : 'Save Template'}</button>
        {editingId ? <button className="btn btn-secondary ms-2" onClick={()=>{ setEditingId(null); setName(''); setMappingJson('{}'); }}>Cancel</button> : null}
      </div>

      <h4>Saved Templates</h4>
      <table className="table table-sm">
        <thead><tr><th>Name</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          {templates.map(t => (
            <tr key={t._id}>
              <td>{t.name}</td>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
              <td>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={()=>edit(t)}>Edit</button>
                <button className="btn btn-sm btn-outline-primary me-1" onClick={()=>copyMapping(t)}>Copy</button>
                <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(t._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCsvMappings;