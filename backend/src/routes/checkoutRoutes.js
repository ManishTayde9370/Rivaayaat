const express = require('express');
const router = express.Router();

const {
  createOrder,
  verifyPaymentAndPlaceOrder,
  getRazorpayKey,
} = require('../controller/checkoutController');

const { requireAuth } = require('../middleware/authMiddleware');
const Order = require('../model/Order');

// ✅ PUBLIC: Get Razorpay key (no auth required)
router.get('/razorpay-key', getRazorpayKey);

// ✅ AUTH: Create Razorpay order (user must be logged in)
router.post('/create-order', requireAuth, createOrder);

// ✅ AUTH: Verify payment and place order (cart comes from frontend)
router.post('/verify-and-place-order', requireAuth, verifyPaymentAndPlaceOrder);

// ✅ USER: Get all orders for the logged-in user
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('❌ Error fetching user orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// ✅ USER: Get user messages (placeholder, returns empty array)
router.get('/messages', requireAuth, async (req, res) => {
  res.json([]);
});

module.exports = router;
