const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const { 
  requireAdmin, 
  sanitizeInput, 
  limitRequestSize, 
  adminRateLimit 
} = require('../middleware/authMiddleware');
const adminController = require('../controller/adminController');
const { 
  getAllOrders, 
  updateOrderStatus, 
  getRecentOrders,
  getOrderAnalytics 
} = require('../controller/checkoutController');

// ✅ Input validation rules
const userValidation = [
  param('id').isMongoId().withMessage('Invalid user ID format'),
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
];

const searchValidation = [
  query('search').optional().isLength({ max: 100 }).withMessage('Search term too long'),
];

// ✅ Enhanced date validation that allows empty strings
const optionalDateValidation = [
  query('regStart').optional().custom((value) => {
    if (value && value !== '') {
      if (!Date.parse(value)) {
        throw new Error('Invalid registration start date');
      }
    }
    return true;
  }),
  query('regEnd').optional().custom((value) => {
    if (value && value !== '') {
      if (!Date.parse(value)) {
        throw new Error('Invalid registration end date');
      }
    }
    return true;
  }),
  query('loginStart').optional().custom((value) => {
    if (value && value !== '') {
      if (!Date.parse(value)) {
        throw new Error('Invalid login start date');
      }
    }
    return true;
  }),
  query('loginEnd').optional().custom((value) => {
    if (value && value !== '') {
      if (!Date.parse(value)) {
        throw new Error('Invalid login end date');
      }
    }
    return true;
  }),
  query('orderStart').optional().custom((value) => {
    if (value && value !== '') {
      if (!Date.parse(value)) {
        throw new Error('Invalid order start date');
      }
    }
    return true;
  }),
  query('orderEnd').optional().custom((value) => {
    if (value && value !== '') {
      if (!Date.parse(value)) {
        throw new Error('Invalid order end date');
      }
    }
    return true;
  }),
];

const orderStatusValidation = [
  body('status').isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
    .withMessage('Invalid order status'),
];

const productTrendsValidation = [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
];

// ✅ Admin Dashboard Overview
router.get('/dashboard', 
  requireAdmin, 
  adminController.dashboard
);

// ✅ Get all users with analytics (enhanced with pagination and search)
router.get('/users', 
  requireAdmin, 
  sanitizeInput,
  [...paginationValidation, ...searchValidation, ...optionalDateValidation],
  adminController.validateAdminInput,
  adminController.getAllUsers
);

// ✅ Promote user to admin (with validation)
router.patch('/users/:id/promote', 
  requireAdmin, 
  adminRateLimit,
  sanitizeInput,
  userValidation,
  adminController.validateAdminInput,
  adminController.promoteUser
);

// ✅ Block/unblock user (with validation)
router.patch('/users/:id/block', 
  requireAdmin, 
  adminRateLimit,
  sanitizeInput,
  userValidation,
  adminController.validateAdminInput,
  adminController.blockUser
);

// ✅ Get user orders (with pagination)
router.get('/users/:id/orders', 
  requireAdmin, 
  sanitizeInput,
  userValidation,
  [...paginationValidation],
  adminController.validateAdminInput,
  adminController.getUserOrders
);

// ✅ Get product trends (with validation)
router.get('/product-trends', 
  requireAdmin, 
  sanitizeInput,
  productTrendsValidation,
  adminController.validateAdminInput,
  adminController.getProductTrends
);

// ✅ Get all admins
router.get('/admins', 
  requireAdmin, 
  adminController.getAllAdmins
);

// ✅ Delete user (with validation)
router.delete('/users/:id', 
  requireAdmin, 
  adminRateLimit,
  sanitizeInput,
  userValidation,
  adminController.validateAdminInput,
  adminController.deleteUser
);

// ✅ Get all orders (admin) - enhanced with pagination
router.get('/orders', 
  requireAdmin, 
  sanitizeInput,
  [...paginationValidation, ...optionalDateValidation],
  adminController.validateAdminInput,
  getAllOrders
);

// ✅ Get recent orders (admin)
router.get('/orders/recent', 
  requireAdmin, 
  sanitizeInput,
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  adminController.validateAdminInput,
  getRecentOrders
);

// ✅ Update order status (admin) - enhanced with validation
router.patch('/orders/:id/status', 
  requireAdmin, 
  adminRateLimit,
  sanitizeInput,
  param('id').isMongoId().withMessage('Invalid order ID format'),
  orderStatusValidation,
  adminController.validateAdminInput,
  updateOrderStatus
);

// ✅ Get order analytics
router.get('/orders/analytics', 
  requireAdmin, 
  sanitizeInput,
  optionalDateValidation,
  adminController.validateAdminInput,
  getOrderAnalytics
);

// ✅ Get user analytics
router.get('/users/analytics', 
  requireAdmin, 
  sanitizeInput,
  optionalDateValidation,
  adminController.validateAdminInput,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const match = {};
      if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
      }

      const analytics = await require('../model/Users').aggregate([
        { $match: { ...match, isAdmin: false } },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: [{ $gt: ['$lastLogin', null] }, 1, 0] }
            },
            blockedUsers: {
              $sum: { $cond: [{ $eq: ['$isBlocked', true] }, 1, 0] }
            }
          }
        }
      ]);

      const result = analytics[0] || {
        totalUsers: 0,
        activeUsers: 0,
        blockedUsers: 0
      };

      res.json({
        success: true,
        analytics: result
      });
    } catch (error) {
      console.error('❌ User analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user analytics',
        error: error.message
      });
    }
  }
);

// Settings routes
router.get('/settings', requireAdmin, adminController.getAllSettings);
router.put('/settings/:key', requireAdmin, adminController.updateSetting);

// ✅ Get system health
router.get('/health', 
  requireAdmin, 
  async (req, res) => {
    try {
      const health = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        database: 'connected', // You can add actual DB health check here
        admin: req.user.email
      };

      res.json({
        success: true,
        health
      });
    } catch (error) {
      console.error('❌ Health check error:', error);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  }
);

// ✅ Error handling middleware for admin routes
router.use((error, req, res, next) => {
  console.error('❌ Admin route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error in admin routes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;