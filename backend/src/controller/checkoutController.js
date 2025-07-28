const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../model/Order');
require('dotenv').config();
const User = require('../model/Users');
const sendOrderConfirmationEmail = require('../utils/sendOrderConfirmationEmail');
const Product = require('../model/Product');

// ✅ Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Send Razorpay Key to frontend
exports.getRazorpayKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};

// ✅ Create Razorpay Order
exports.createOrder = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  try {
    const options = {
      amount: amount * 100, // Convert to paisa
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(201).json(order);
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
    });
  }
};

// ✅ Verify Payment and Place Order
exports.verifyPaymentAndPlaceOrder = async (req, res) => {
  try {
    // 👤 Make sure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Access denied. Please log in.' });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems,
      amount,
      shippingAddress,
    } = req.body;

    // 🔍 Validate cart items
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty or missing' });
    }

    // 🔍 Validate shipping address
    if (
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is incomplete',
      });
    }

    // 🔒 Validate Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed',
      });
    }

    // 💰 Validate amount
    const calculatedTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (calculatedTotal !== amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch. Please try again.',
      });
    }

    // 🛑 Stock validation before placing order
    const stockValidationResults = [];
    for (const item of cartItems) {
      const productId = item.productId || item._id;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Only ${product.stock} left.` });
      }
      stockValidationResults.push({ product, item });
    }

    // 📦 Prepare order items
    const formattedItems = cartItems.map((item, index) => {
      if (!item.productId && !item._id) {
        console.warn(`❌ Item at index ${index} is missing productId/_id:`, item);
      }

      return {
        productId: item.productId || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
      };
    });

    // 🧾 Create and save order
    const newOrder = new Order({
      user: req.user._id.toString(),
      items: formattedItems,
      amountPaid: calculatedTotal,
      paymentInfo: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
      shippingAddress,
      isPaid: true,
      paidAt: new Date(),
      status: 'Processing',
    });

    await newOrder.save();

    // 📉 Decrement product stock for each item
    for (const { product, item } of stockValidationResults) {
      product.stock -= item.quantity;
      await product.save();
    }

    // Emit real-time event to user (only for order updates, not notifications)
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const socketId = userSockets.get(req.user._id.toString());
    
    if (io && socketId) {
      io.to(socketId).emit('orderUpdated', { order: newOrder });
      // Removed duplicate notification emit - frontend handles toasts
    }

    // 📧 Send order confirmation email (optional)
    try {
      const user = await User.findById(req.user._id);
      if (user?.email) {
        await sendOrderConfirmationEmail(user.email, newOrder);
      }
    } catch (emailError) {
      console.warn('⚠️ Failed to send order confirmation email:', emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder,
    });

  } catch (error) {
    console.error('❌ Order placement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to place order. Please try again.',
      error: error.message,
    });
  }
};

// ✅ Get all orders for the logged-in user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// ✅ Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }
    
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    
    return res.status(200).json({ success: true, message: 'Order status updated.', order });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

// ✅ Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // ✅ Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 1000.' 
      });
    }
    
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.month) {
      const year = new Date().getFullYear();
      const month = parseInt(req.query.month);
      if (month < 0 || month > 11) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid month parameter. Must be between 0 and 11.' 
        });
      }
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    let query = Order.find(filter)
      .populate('user', 'email name')
      .sort({ createdAt: -1 });

    query = query.skip(skip).limit(limit);
    let orders = await query.exec();

    if (req.query.email) {
      const email = req.query.email.toLowerCase();
      orders = orders.filter(o =>
        (o.user?.email && o.user.email.toLowerCase().includes(email)) ||
        (o.shippingAddress?.email && o.shippingAddress.email.toLowerCase().includes(email))
      );
    }

    const total = await Order.countDocuments(filter);

    return res.status(200).json({
      success: true,
      orders,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Error fetching all orders:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// ✅ Get recent orders (admin only)
exports.getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    if (limit < 1 || limit > 50) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid limit parameter. Must be between 1 and 50.' 
      });
    }

    const orders = await Order.find()
      .populate('user', 'email name')
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('❌ Error fetching recent orders:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch recent orders.' });
  }
};

// ✅ Get order analytics (admin only)
exports.getOrderAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const analytics = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $ifNull: ['$amountPaid', 0] } },
          averageOrderValue: { $avg: { $ifNull: ['$amountPaid', 0] } },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Processing'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = analytics[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      processingOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0
    };

    res.json({
      success: true,
      analytics: result
    });
  } catch (error) {
    console.error('❌ Order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order analytics',
      error: error.message
    });
  }
};
