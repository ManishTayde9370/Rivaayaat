const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../model/Order');
require('dotenv').config();
const User = require('../model/Users');
const sendOrderConfirmationEmail = require('../utils/sendOrderConfirmationEmail');

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

    // 📦 Prepare order items
    // const formattedItems = cartItems.map(item => ({
    //   product: item.product, // must be ObjectId
    //   quantity: item.quantity,
    //   price: item.price,
    // }));
    console.log("🧾 Incoming cart items:", cartItems);

const formattedItems = cartItems.map((item, index) => {
  if (!item.productId && !item._id) {
    console.warn(`❌ Item at index ${index} is missing productId/_id:`, item);
  }

  return {
    productId: item.productId || item._id, // Ensure productId is always present
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image || '',
  };
});



    // 🧾 Create and save order
    // const newOrder = new Order({
    //   user: req.user._id.toString(),
    //   items: formattedItems,
    //   total: calculatedTotal,
    //   amountPaid: calculatedTotal,
    //   paymentId: razorpay_payment_id,
    //   razorpayOrderId: razorpay_order_id,
    //   shippingAddress,
    //   status: 'Processing', // Must match enum in your Order schema
    //   paymentStatus: 'Verified', // Must match enum
    // });
    console.log('✅ Formatted Items:', formattedItems);

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

    // Send invoice email to shipping address email
    try {
      if (shippingAddress.email) {
        await sendOrderConfirmationEmail(shippingAddress.email, newOrder);
      }
    } catch (emailErr) {
      console.error('Failed to send order confirmation email:', emailErr);
    }

    return res.status(200).json({
      success: true,
      order: newOrder,
      message: shippingAddress.mobile
        ? `A confirmation has been sent to your email. For your records, your payment was made with mobile number: ${shippingAddress.mobile}`
        : 'A confirmation has been sent to your email.'
    });
  } catch (error) {
    console.error('🔴 Verification or order placement error:', error);
    return res.status(500).json({
      success: false,
      message:
        error?.message || 'Server error during payment verification or order placement',
    });
  }
};
