const crypto = require('crypto');
const Order = require('../model/Order');
const Cart = require('../model/Cart');

exports.verifyPaymentAndPlaceOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    // ✅ Verify Razorpay Signature with correct secret key
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // 🛒 Fetch user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // 📦 Create Order
    const order = new Order({
      user: userId,
      products: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount: cart.items.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
      ),
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentStatus: 'Paid',
      status: 'Processing',
      placedAt: new Date(),
    });

    await order.save();

    // 🧹 Clear Cart
    cart.items = [];
    await cart.save();

    return res.status(200).json({ success: true, message: 'Order placed successfully', order });
  } catch (err) {
    console.error('❌ Order placement error:', err);
    res.status(500).json({ success: false, message: 'Could not place order' });
  }
};

// Update order status by ID (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required.' });
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json({ message: 'Order status updated.', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.month) {
      // month: 0-11 (JS Date)
      const year = new Date().getFullYear();
      const month = parseInt(req.query.month);
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 1);
      filter.createdAt = { $gte: start, $lt: end };
    }
    if (req.query.email) {
      // Will filter after population
    }

    // Query
    let query = Order.find(filter)
      .populate('user', 'email name')
      .sort({ createdAt: -1 });

    // Pagination
    query = query.skip(skip).limit(limit);

    let orders = await query.exec();

    // Email filter (after population)
    if (req.query.email) {
      const email = req.query.email.toLowerCase();
      orders = orders.filter(o =>
        (o.user?.email && o.user.email.toLowerCase().includes(email)) ||
        (o.shippingAddress?.email && o.shippingAddress.email.toLowerCase().includes(email))
      );
    }

    // Total count for pagination
    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      total,
      page,
      limit
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

// Get latest 5 recent orders
exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email name')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent orders.' });
  }
};
