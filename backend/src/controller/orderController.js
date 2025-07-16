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
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};
