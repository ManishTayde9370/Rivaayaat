import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import { toast } from 'react-toastify';

const AdminSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverEndpoint}/api/admin/settings`, { withCredentials: true });
      setSettings(res.data.settings || []);
    } catch (err) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting) => {
    setEditKey(setting.key);
    setEditValue(setting.value);
    setEditDescription(setting.description || '');
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `${serverEndpoint}/api/admin/settings/${editKey}`,
        { value: editValue, description: editDescription },
        { withCredentials: true }
      );
      toast.success('Setting updated');
      setEditKey(null);
      fetchSettings();
    } catch (err) {
      toast.error('Failed to update setting');
    }
  };

  return (
    <div className="container py-4">
      <h2>Admin Settings</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((setting) => (
              <tr key={setting._id}>
                <td>{setting.key}</td>
                <td>
                  {editKey === setting.key ? (
                    <input
                      className="form-control"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                    />
                  ) : (
                    String(setting.value)
                  )}
                </td>
                <td>
                  {editKey === setting.key ? (
                    <input
                      className="form-control"
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                    />
                  ) : (
                    setting.description
                  )}
                </td>
                <td>
                  {editKey === setting.key ? (
                    <>
                      <button className="btn btn-success btn-sm me-2" onClick={handleSave}>Save</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditKey(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(setting)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminSettings; 