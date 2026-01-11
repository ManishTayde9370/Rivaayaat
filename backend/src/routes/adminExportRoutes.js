const express = require('express');
const router = express.Router();
const ScheduledExport = require('../model/ScheduledExport');
const { requireAdmin } = require('../middleware/authMiddleware');
const scheduledRunner = require('../utils/scheduledExportRunner');

// Create scheduled export
router.post('/', requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const s = new ScheduledExport(data);
    await s.save();
    // start runner for new schedule (runner will pick enabled ones on init; allow on-demand start)
    scheduledRunner.registerJob(s);
    return res.json({ success: true, schedule: s });
  } catch (err) {
    console.error('Create schedule error:', err);
    res.status(500).json({ success: false, message: 'Failed to create schedule' });
  }
});

// List schedules
router.get('/', requireAdmin, async (req, res) => {
  try {
    const list = await ScheduledExport.find().sort({ createdAt: -1 });
    return res.json({ success: true, schedules: list });
  } catch (err) {
    console.error('List schedules error:', err);
    res.status(500).json({ success: false, message: 'Failed to list schedules' });
  }
});

// Update schedule
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await ScheduledExport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updated) scheduledRunner.refreshJob(updated);
    return res.json({ success: true, schedule: updated });
  } catch (err) {
    console.error('Update schedule error:', err);
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
});

// Delete schedule
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const removed = await ScheduledExport.findByIdAndDelete(req.params.id);
    if (removed) scheduledRunner.unregisterJob(removed._id.toString());
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete schedule error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete schedule' });
  }
});

// Trigger now
router.post('/trigger/:id', requireAdmin, async (req, res) => {
  try {
    const job = await ScheduledExport.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Schedule not found' });
    await scheduledRunner.runJobNow(job);
    return res.json({ success: true, message: 'Triggered' });
  } catch (err) {
    console.error('Trigger now error:', err);
    res.status(500).json({ success: false, message: 'Failed to trigger' });
  }
});

// List runs for a schedule
router.get('/:id/runs', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const skip = (page - 1) * limit;
    const runs = await require('../model/ScheduledExportRun').find({ schedule: req.params.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await require('../model/ScheduledExportRun').countDocuments({ schedule: req.params.id });
    return res.json({ success: true, runs, page, total });
  } catch (err) {
    console.error('List runs error:', err);
    res.status(500).json({ success: false, message: 'Failed to list runs' });
  }
});

// Get run details
router.get('/runs/:runId', requireAdmin, async (req, res) => {
  try {
    const run = await require('../model/ScheduledExportRun').findById(req.params.runId).lean();
    if (!run) return res.status(404).json({ success: false, message: 'Run not found' });
    return res.json({ success: true, run });
  } catch (err) {
    console.error('Get run error:', err);
    res.status(500).json({ success: false, message: 'Failed to get run' });
  }
});

// Retry a failed run
router.post('/runs/:runId/retry', requireAdmin, async (req, res) => {
  try {
    await scheduledRunner.retryRun(req.params.runId);
    return res.json({ success: true });
  } catch (err) {
    console.error('Retry run error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to retry' });
  }
});

module.exports = router;