const express = require('express');
const multer = require('multer');
const router = express.Router();
const CSVImportTemplate = require('../model/CSVImportTemplate');
const Product = require('../model/Product');
const { requireAdmin } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Create a mapping template
router.post('/templates', requireAdmin, async (req, res) => {
  try {
    const { name, mapping } = req.body;
    if (!name || !mapping) return res.status(400).json({ success: false, message: 'Name and mapping are required' });
    const tpl = new CSVImportTemplate({ name, mapping, createdBy: req.user?._id });
    await tpl.save();
    return res.json({ success: true, template: tpl });
  } catch (err) {
    console.error('Create template error:', err);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
});

// List templates
router.get('/templates', requireAdmin, async (req, res) => {
  try {
    const templates = await CSVImportTemplate.find().sort({ createdAt: -1 });
    return res.json({ success: true, templates });
  } catch (err) {
    console.error('List templates error:', err);
    res.status(500).json({ success: false, message: 'Failed to list templates' });
  }
});

// Delete template
router.delete('/templates/:id', requireAdmin, async (req, res) => {
  try {
    const removed = await CSVImportTemplate.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ success: false, message: 'Template not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete template error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
});

// Update template
router.put('/templates/:id', requireAdmin, async (req, res) => {
  try {
    const { name, mapping } = req.body;
    const tpl = await CSVImportTemplate.findById(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Template not found' });
    tpl.name = name || tpl.name;
    tpl.mapping = mapping || tpl.mapping;
    await tpl.save();
    return res.json({ success: true, template: tpl });
  } catch (err) {
    console.error('Update template error:', err);
    res.status(500).json({ success: false, message: 'Failed to update template' });
  }
});

// Preview CSV with mapping (dry-run)
router.post('/preview', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { parseLine, validateProductData } = require('../utils/csvUtils');

    const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : null;
    if (!mapping) return res.status(400).json({ success: false, message: 'Mapping is required' });
    if (!req.file || !req.file.buffer) return res.status(400).json({ success: false, message: 'CSV file is required' });

    const content = req.file.buffer.toString('utf8');
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) return res.status(400).json({ success: false, message: 'CSV seems empty' });

    const header = lines[0].split(',').map(h => h.replace(/\"/g, '').trim());

    const preview = [];
    const errors = [];

    for (let i = 1; i < Math.min(lines.length, 101); i++) { // parse up to 100 lines for preview
      const cols = parseLine(lines[i]);
      const row = {};
      header.forEach((h, idx) => { row[h] = (cols[idx] || '').replace(/(^\")|("$)/g, ''); });

      // Apply mapping
      const productData = {};
      Object.keys(mapping).forEach(csvCol => {
        const field = mapping[csvCol];
        productData[field] = row[csvCol] || '';
      });

      // Enhanced validation
      const validation = validateProductData(productData);
      preview.push({ line: i+1, productData, errors: validation });
      if (validation.length) errors.push({ line: i+1, errors: validation });
    }

    return res.json({ success: true, preview, errors });
  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({ success: false, message: 'Failed to preview CSV' });
  }
});

module.exports = router;