const mongoose = require('mongoose');

const scheduledExportRunSchema = new mongoose.Schema({
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledExport', required: true },
  status: { type: String, enum: ['running','success','failed'], default: 'running' },
  attempt: { type: Number, default: 1 },
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
  errorMessage: { type: String },
  details: { type: Object }
}, { timestamps: true });

const ScheduledExportRun = mongoose.model('ScheduledExportRun', scheduledExportRunSchema);
module.exports = ScheduledExportRun;
