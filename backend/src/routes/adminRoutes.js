const express = require('express');
const router = express.Router();

const { requireAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controller/adminController');
const orderController = require('../controller/orderController');

// ✅ Admin Dashboard Overview
router.get('/dashboard', requireAdmin, adminController.dashboard);

// ✅ Get all regular (non-admin) users
router.get('/users', requireAdmin, adminController.getAllUsers);

// ✅ Get all admin users (optional route)
router.get('/admins', requireAdmin, adminController.getAllAdmins);

// ✅ Delete a user by ID (admin only)
router.delete('/users/:id', requireAdmin, adminController.deleteUser);

router.patch('/orders/:id/status', requireAdmin, orderController.updateOrderStatus);
router.get('/orders', requireAdmin, orderController.getAllOrders);


module.exports = router;