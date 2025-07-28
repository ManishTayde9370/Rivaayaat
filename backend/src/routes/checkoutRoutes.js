const express = require('express');
const router = express.Router();

const {
  createOrder,
  verifyPaymentAndPlaceOrder,
  getRazorpayKey,
  getUserOrders,
  updateOrderStatus,
  getAllOrders,
} = require('../controller/checkoutController');

const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// ✅ PUBLIC: Get Razorpay key (no auth required)
router.get('/razorpay-key', getRazorpayKey);

// ✅ AUTH: Create Razorpay order (user must be logged in)
router.post('/create-order', requireAuth, createOrder);

// ✅ AUTH: Verify payment and place order (cart comes from frontend)
router.post('/verify-and-place-order', requireAuth, verifyPaymentAndPlaceOrder);

// ✅ USER: Get all orders for the logged-in user
router.get('/orders', requireAuth, getUserOrders);

// ✅ ADMIN: Get all orders (admin only)
router.get('/admin/orders', requireAdmin, getAllOrders);

// ✅ ADMIN: Update order status (admin only)
router.patch('/admin/orders/:id/status', requireAdmin, updateOrderStatus);

// ✅ USER: Get user messages (placeholder, returns empty array)
router.get('/messages', requireAuth, async (req, res) => {
  res.json([]);
});

module.exports = router;
