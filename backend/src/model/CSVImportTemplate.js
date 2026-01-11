const mongoose = require('mongoose');

const csvImportTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mapping: { type: Object, required: true }, // e.g., { "CSV Column": "productField" }
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const CSVImportTemplate = mongoose.model('CSVImportTemplate', csvImportTemplateSchema);
module.exports = CSVImportTemplate;