const express = require('express');
const router = express.Router();
const LowStockAlert = require('../model/LowStockAlert');
const { requireAdmin } = require('../middleware/authMiddleware');

// GET /api/admin/low-stock - list alerts
router.get('/', requireAdmin, async (req, res) => {
  try {
    const alerts = await LowStockAlert.find().populate('product').sort({ createdAt: -1 });
    return res.json({ success: true, alerts });
  } catch (err) {
    console.error('List low-stock alerts error:', err);
    res.status(500).json({ success: false, message: 'Failed to list low-stock alerts' });
  }
});

// POST /api/admin/low-stock/ack/:productId - acknowledge an alert
router.post('/ack/:productId', requireAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const alert = await LowStockAlert.findOneAndUpdate({ product: productId }, { acknowledged: true }, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    return res.json({ success: true, alert });
  } catch (err) {
    console.error('Acknowledge low-stock alert error:', err);
    res.status(500).json({ success: false, message: 'Failed to acknowledge alert' });
  }
});

// DELETE /api/admin/low-stock/resolve/:productId - resolve (delete) an alert
router.delete('/resolve/:productId', requireAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const removed = await LowStockAlert.findOneAndDelete({ product: productId });
    if (!removed) return res.status(404).json({ success: false, message: 'Alert not found' });
    return res.json({ success: true, message: 'Alert resolved' });
  } catch (err) {
    console.error('Resolve low-stock alert error:', err);
    res.status(500).json({ success: false, message: 'Failed to resolve alert' });
  }
});

module.exports = router;
