const User = require('../model/Users');
const Order = require('../model/Order');
const Setting = require('../model/Setting');
const { validationResult } = require('express-validator');

// ✅ Input validation middleware
const validateAdminInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// ✅ Enhanced error handling wrapper
const handleAsyncError = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error('❌ Admin Controller Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  };
};

// ✅ Admin dashboard overview with enhanced security
const dashboard = handleAsyncError(async (req, res) => {
  try {
    // ✅ Log dashboard access
    console.log(`🔐 Admin Dashboard accessed by: ${req.user.email} at ${new Date().toISOString()}`);
    
    return res.status(200).json({
      success: true,
      message: `Welcome Admin, ${req.user.name}`,
      userInfo: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error("❌ Admin dashboard error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Server error while loading admin dashboard",
      error: error.message || error
    });
  }
});

// ✅ Enhanced fetch all non-admin registered users with pagination
const getAllUsers = handleAsyncError(async (req, res) => {
  try {
    const { 
      regStart, 
      regEnd, 
      loginStart, 
      loginEnd, 
      orderStart, 
      orderEnd,
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // ✅ Input validation
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters'
      });
    }

    const userQuery = { isAdmin: false };
    
    // ✅ Search functionality
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    // ✅ Date filtering
    if (regStart || regEnd) {
      userQuery.createdAt = {};
      if (regStart) userQuery.createdAt.$gte = new Date(regStart);
      if (regEnd) userQuery.createdAt.$lte = new Date(regEnd);
    }
    
    if (loginStart || loginEnd) {
      userQuery.lastLogin = {};
      if (loginStart) userQuery.lastLogin.$gte = new Date(loginStart);
      if (loginEnd) userQuery.lastLogin.$lte = new Date(loginEnd);
    }

    // ✅ Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // ✅ Get users with pagination
    const users = await User.find(userQuery)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // ✅ Get total count for pagination
    const totalUsers = await User.countDocuments(userQuery);

    const userIds = users.map(u => u._id);

    // ✅ Order aggregation with date filtering
    let orderMatch = { user: { $in: userIds } };
    if (orderStart || orderEnd) {
      orderMatch.createdAt = {};
      if (orderStart) orderMatch.createdAt.$gte = new Date(orderStart);
      if (orderEnd) orderMatch.createdAt.$lte = new Date(orderEnd);
    }

    const orders = await Order.aggregate([
      { $match: orderMatch },
      { $group: {
          _id: '$user',
          count: { $sum: 1 },
          lastOrder: { $max: '$createdAt' },
          totalValue: { $sum: { $ifNull: ['$amountPaid', 0] } },
        }
      }
    ]);

    // ✅ Most popular product per user
    const popularProducts = await Order.aggregate([
      { $match: orderMatch },
      { $unwind: '$items' },
      { $group: {
          _id: { user: '$user', product: '$items.product' },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $group: {
          _id: '$_id.user',
          product: { $first: '$_id.product' },
          count: { $first: '$count' }
        }
      }
    ]);

    // ✅ Create lookup maps
    const orderMap = {};
    orders.forEach(o => {
      orderMap[o._id.toString()] = {
        count: o.count,
        lastOrder: o.lastOrder,
        totalValue: o.totalValue
      };
    });

    const popularMap = {};
    popularProducts.forEach(p => {
      popularMap[p._id.toString()] = { product: p.product, count: p.count };
    });

    // ✅ Populate product names
    const productIds = popularProducts.map(p => p.product).filter(Boolean);
    let productMap = {};
    if (productIds.length) {
      const products = await require('../model/Product').find({ _id: { $in: productIds } });
      productMap = Object.fromEntries(products.map(p => [p._id.toString(), p.name]));
    }

    // ✅ Combine user data with analytics
    const usersWithOrders = users.map(u => ({
      ...u.toObject(),
      totalOrders: orderMap[u._id.toString()]?.count || 0,
      lastOrderDate: orderMap[u._id.toString()]?.lastOrder || null,
      totalOrderValue: orderMap[u._id.toString()]?.totalValue || 0,
      mostPopularProduct: popularMap[u._id.toString()]?.product ? {
        id: popularMap[u._id.toString()].product,
        name: productMap[popularMap[u._id.toString()].product?.toString()] || '—',
        count: popularMap[u._id.toString()].count
      } : null
    }));

    // ✅ Calculate analytics
    const analytics = {
      totalUsers: totalUsers,
      activeUsers: usersWithOrders.filter(u => u.totalOrders > 0).length,
      totalOrders: orders.reduce((sum, o) => sum + o.count, 0),
      totalRevenue: orders.reduce((sum, o) => sum + o.totalValue, 0),
      averageOrderValue: orders.length > 0 ? 
        orders.reduce((sum, o) => sum + o.totalValue, 0) / orders.reduce((sum, o) => sum + o.count, 0) : 0
    };

    return res.status(200).json({
      success: true,
      users: usersWithOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limitNum)
      },
      analytics,
      filters: {
        search,
        regStart,
        regEnd,
        loginStart,
        loginEnd,
        orderStart,
        orderEnd
      }
    });

  } catch (error) {
    console.error('❌ Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// ✅ Enhanced get all admins
const getAllAdmins = handleAsyncError(async (req, res) => {
  try {
    const admins = await User.find({ isAdmin: true }).select('-password');
    
    return res.status(200).json({
      success: true,
      admins: admins
    });
  } catch (error) {
    console.error('❌ Get all admins error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: error.message
    });
  }
});

// ✅ Enhanced delete user with validation
const deleteUser = handleAsyncError(async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate user ID
    if (!id || id === req.user._id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or cannot delete yourself'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ Check if user has orders
    const userOrders = await Order.find({ user: id });
    if (userOrders.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with existing orders'
      });
    }

    await User.findByIdAndDelete(id);
    
    console.log(`🔐 User deleted by admin ${req.user.email}: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// ✅ Enhanced promote user with validation
const promoteUser = handleAsyncError(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }

    user.isAdmin = true;
    await user.save();

    console.log(`🔐 User promoted to admin by ${req.user.email}: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'User promoted to admin successfully'
    });

  } catch (error) {
    console.error('❌ Promote user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to promote user',
      error: error.message
    });
  }
});

// ✅ Enhanced block user with validation
const blockUser = handleAsyncError(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === req.user._id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or cannot block yourself'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    const action = user.isBlocked ? 'blocked' : 'unblocked';
    console.log(`🔐 User ${action} by admin ${req.user.email}: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: `User ${action} successfully`,
      isBlocked: user.isBlocked
    });

  } catch (error) {
    console.error('❌ Block user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

// ✅ Enhanced get user orders with pagination
const getUserOrders = handleAsyncError(async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find({ user: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('items.product', 'name price image');

    const totalOrders = await Order.countDocuments({ user: id });

    return res.status(200).json({
      success: true,
      orders: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limitNum)
      }
    });

  } catch (error) {
    console.error('❌ Get user orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
      error: error.message
    });
  }
});

// ✅ Enhanced get product trends
const getProductTrends = handleAsyncError(async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);

    if (daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        message: 'Days must be between 1 and 365'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const trends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'Cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    // ✅ Populate product details
   const productIds = trends
  .filter(p => p && p._id)
  .map(p => p._id.toString());

    const products = await require('../model/Product').find({ _id: { $in: productIds } });
    const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));

    const trendsWithDetails = trends.map(trend => ({
      productId: trend._id,
      productName: productMap[trend._id.toString()]?.name || 'Unknown Product',
      totalQuantity: trend.totalQuantity,
      totalRevenue: trend.totalRevenue,
      orderCount: trend.orderCount,
      averagePrice: trend.totalRevenue / trend.totalQuantity
    }));

    return res.status(200).json({
      success: true,
      trends: trendsWithDetails,
      period: `${daysNum} days`
    });

  } catch (error) {
    console.error('❌ Get product trends error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product trends',
      error: error.message
    });
  }
});

// Get all settings
function getAllSettings(req, res) {
  Setting.find({})
    .then(settings => res.json({ success: true, settings }))
    .catch(error => {
      console.error('❌ Get all settings error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    });
}

// Update a setting by key
function updateSetting(req, res) {
  const { key } = req.params;
  const { value, description } = req.body;
  if (!key) return res.status(400).json({ success: false, message: 'Key is required' });
  Setting.findOneAndUpdate(
    { key },
    { value, description },
    { new: true, upsert: true }
  )
    .then(updated => res.json({ success: true, setting: updated }))
    .catch(error => {
      console.error('❌ Update setting error:', error);
      res.status(500).json({ success: false, message: 'Failed to update setting' });
    });
}

module.exports = {
  dashboard,
  getAllUsers,
  getAllAdmins,
  deleteUser,
  promoteUser,
  blockUser,
  getUserOrders,
  getProductTrends,
  validateAdminInput,
  getAllSettings,
  updateSetting
};

