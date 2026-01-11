import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import { showNotification } from '../utils/notifications';
import CsvPreviewModal from '../components/CsvPreviewModal';

const API_BASE = `${serverEndpoint}/api/admin/products`;

const AdminProductImportExport = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [preview, setPreview] = useState([]);
  const [previewErrors, setPreviewErrors] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const downloadCSV = async () => {
    try {
      const res = await axios.get(`${API_BASE}/export-csv`, { responseType: 'blob', withCredentials: true });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showNotification.error('Failed to download CSV');
    }
  };

  useEffect(() => { const loadTemplates = async () => { try { const res = await axios.get(`${serverEndpoint}/api/admin/csv/templates`, { withCredentials: true }); setTemplates(res.data.templates || []); } catch (err) {} }; loadTemplates(); }, []);

  const uploadCSV = async (e) => {
    e.preventDefault();
    if (!file) return showNotification.warning('Please select a CSV file');

    // If a template is selected, run preview and show modal for user confirmation
    if (selectedTemplate) {
      try {
        const form = new FormData();
        form.append('file', file);
        form.append('mapping', JSON.stringify(selectedTemplate.mapping));
        const res = await axios.post(`${serverEndpoint}/api/admin/csv/preview`, form, { withCredentials: true });
        setPreview(res.data.preview || []);
        setPreviewErrors(res.data.errors || []);
        setShowPreviewModal(true);
        return;
      } catch (err) {
        showNotification.error('Preview failed');
        return;
      }
    }

    // No template: do direct import
    const form = new FormData();
    form.append('file', file);
    setUploading(true);
    try {
      const res = await axios.post(`${API_BASE}/import-csv`, form, { withCredentials: true });
      showNotification.success(`Import completed. Created: ${res.data.created}, Updated: ${res.data.updated}`);
    } catch (err) {
      showNotification.error('Failed to import CSV');
    } finally {
      setUploading(false);
    }
  };

  const confirmImport = async () => {
    if (!file) return;
    setIsImporting(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('mapping', JSON.stringify(selectedTemplate.mapping));
      const res = await axios.post(`${API_BASE}/import-csv`, form, { withCredentials: true });
      showNotification.success(`Import completed. Created: ${res.data.created}, Updated: ${res.data.updated}`);
      setShowPreviewModal(false);
      setPreview([]);
      setPreviewErrors([]);
    } catch (err) {
      showNotification.error('Failed to import CSV');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="admin-card">
      <h2>Product Import / Export</h2>
      <p className="text-muted">Download all products as CSV or upload a CSV to bulk create/update products. CSV images column supports multiple image URLs separated by <code>|</code>.</p>

      <div className="mb-3">
        <button className="btn btn-primary me-2" onClick={downloadCSV}>Download CSV</button>
        <a href="#template" className="small text-muted">Need a template? Use the downloaded CSV</a>
      </div>

      <form onSubmit={uploadCSV}>
        <div className="mb-3">
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        <div className="mb-3">
          <select className="form-select" value={selectedTemplate?._id || ''} onChange={(e)=>{
            const id = e.target.value; setSelectedTemplate(templates.find(t=>t._id===id)||null);
          }}>
            <option value="">No template</option>
            {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <button className="btn btn-success" type="submit" disabled={uploading || isImporting}>{(uploading || isImporting) ? 'Working...' : 'Upload CSV'}</button>
        </div>
      </form>

      <CsvPreviewModal isOpen={showPreviewModal} preview={preview} errors={previewErrors} onClose={()=>setShowPreviewModal(false)} onConfirm={confirmImport} isImporting={isImporting} />
    </div>
  );
};

export default AdminProductImportExport;
