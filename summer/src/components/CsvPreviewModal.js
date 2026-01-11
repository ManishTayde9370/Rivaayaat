import React from 'react';

const CsvPreviewModal = ({ isOpen, preview = [], errors = [], onClose, onConfirm, isImporting }) => {
  const [filter, setFilter] = React.useState('all');

  if (!isOpen) return null;
  const fields = new Set();
  preview.forEach(p => Object.keys(p.productData).forEach(f => fields.add(f)));
  const cols = Array.from(fields);

  const filtered = preview.filter(r => (filter === 'all') || (filter === 'errors' && r.errors && r.errors.length));

  const downloadPreviewCsv = () => {
    const headers = cols.join(',');
    const rows = filtered.map(r => cols.map(c => `"${String(r.productData[c] || '').replace(/"/g, '""')}"`).join(','));
    const csv = headers + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', 'preview.csv'); document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <div className="csv-preview-modal" style={{position:'fixed',top:0,left:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.4)',zIndex:2000}}>
      <div className="modal-content p-3 bg-white" style={{width:'90%',maxWidth:900,maxHeight:'85%',overflowY:'auto',borderRadius:6}}>
        <h5>CSV Preview</h5>
        <p className="text-muted">Showing up to first {preview.length} rows. Rows with validation errors are highlighted.</p>

        <div className="mb-2 d-flex align-items-center">
          <div className="btn-group me-2" role="group">
            <button className={`btn btn-sm ${filter==='all'?'btn-primary':'btn-outline-primary'}`} onClick={()=>setFilter('all')}>All</button>
            <button className={`btn btn-sm ${filter==='errors'?'btn-primary':'btn-outline-primary'}`} onClick={()=>setFilter('errors')}>Errors</button>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={downloadPreviewCsv}>Download Preview CSV</button>
        </div>

        <table className="table table-sm">
          <thead>
            <tr>
              <th>Line</th>
              {cols.map(c=> <th key={c}>{c}</th>)}
              <th>Errors</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r=> (
              <tr key={r.line} style={{background: r.errors && r.errors.length ? '#fff2f0' : 'transparent'}}>
                <td>{r.line}</td>
                {cols.map(c => <td key={c}>{r.productData[c]}</td>)}
                <td>{(r.errors || []).map(e => `${e.code}: ${e.message}`).join('; ')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {errors && errors.length ? <div className="alert alert-warning">Found {errors.length} rows with validation issues. You can still proceed to import if you wish.</div> : null}

        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm} disabled={isImporting}>{isImporting ? 'Importing...' : 'Proceed with Import'}</button>
        </div>
      </div>
    </div>
  );
};

export default CsvPreviewModal;
