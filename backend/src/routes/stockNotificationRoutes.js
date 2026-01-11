const express = require('express');
const router = express.Router();
const StockNotification = require('../model/StockNotification');
const Product = require('../model/Product');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// POST /api/stock-notify/:productId - subscribe (requires auth for MVP)
router.post('/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const email = req.user?.email;
    if (!email) return res.status(400).json({ success: false, message: 'User email not available' });

    // Create or ignore if exists
    try {
      const sub = new StockNotification({ product: productId, user: req.user._id, email });
      await sub.save();
      return res.json({ success: true, message: 'Subscribed to stock notifications' });
    } catch (err) {
      if (err.code === 11000) {
        return res.json({ success: true, message: 'Already subscribed' });
      }
      throw err;
    }
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ success: false, message: 'Failed to subscribe' });
  }
});

// DELETE /api/stock-notify/:productId - unsubscribe
router.delete('/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const removed = await StockNotification.deleteMany({ product: productId, user: req.user._id });
    return res.json({ success: true, removed: removed.deletedCount });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).json({ success: false, message: 'Failed to unsubscribe' });
  }
});

// GET /api/stock-notify/my/:productId - check subscription for current user
router.get('/my/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const exists = await StockNotification.findOne({ product: productId, user: req.user._id });
    return res.json({ subscribed: !!exists });
  } catch (err) {
    console.error('Check subscription error:', err);
    res.status(500).json({ success: false, message: 'Failed to check subscription' });
  }
});

// GET /api/stock-notify - admin: list subs (optional filter ?product=)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.product) filter.product = req.query.product;
    const subs = await StockNotification.find(filter).populate('product').populate('user');
    return res.json({ success: true, subscriptions: subs });
  } catch (err) {
    console.error('List subscriptions error:', err);
    res.status(500).json({ success: false, message: 'Failed to list subscriptions' });
  }
});

// POST /api/stock-notify/trigger/:productId - admin: trigger sending notifications for a product
router.post('/trigger/:productId', requireAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const subs = await StockNotification.find({ product: productId, notified: false }).populate('user');
    if (!subs || subs.length === 0) return res.json({ success: true, message: 'No pending subscriptions' });

    let sent = 0;
    await Promise.all(subs.map(async (sub) => {
      const toEmail = sub.email || (sub.user && sub.user.email);
      if (!toEmail) return;
      try {
        await sendStockNotificationEmail(toEmail, product);
        sub.notified = true;
        await sub.save();
        sent++;
      } catch (err) {
        console.error('❌ Failed to send stock notification to', toEmail, err.message);
      }
    }));

    return res.json({ success: true, sent });
  } catch (err) {
    console.error('Trigger notifications error:', err);
    res.status(500).json({ success: false, message: 'Failed to trigger notifications' });
  }
});

// DELETE /api/stock-notify/:id - admin: remove a subscription by id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await StockNotification.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ success: false, message: 'Subscription not found' });
    return res.json({ success: true, message: 'Subscription removed' });
  } catch (err) {
    console.error('Admin remove subscription error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove subscription' });
  }
});

module.exports = router;
