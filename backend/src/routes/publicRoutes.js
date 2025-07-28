const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const Order = require('../model/Order');
const CareerApplication = require('../model/CareerApplication');
const Blog = require('../model/Blog');
const Store = require('../model/Store');
const FAQ = require('../model/FAQ');
const FAQQuestion = require('../model/FAQQuestion');
const User = require('../model/Users');

// --- Track Order ---
const trackOrderValidator = [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
  }
];

router.post('/orders/track', trackOrderValidator, async (req, res) => {
  try {
    const { orderId, email } = req.body;
    const order = await Order.findOne({ _id: orderId, 'shippingAddress.email': email });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.json({ success: true, order });
  } catch (err) {
    console.error('❌ Error tracking order:', err);
    return res.status(500).json({ success: false, message: 'Failed to track order' });
  }
});

// --- User Orders (Public) ---
router.get('/orders', async (req, res) => {
  try {
    const { userId, status, start, end } = req.query;
    let query = { user: userId };
    if (status) query.status = status;
    if (start || end) {
      query.createdAt = {};
      if (start) query.createdAt.$gte = new Date(start);
      if (end) query.createdAt.$lte = new Date(end);
    }
    const orders = await Order.find(query);
    return res.json({ success: true, orders });
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// --- Careers Application ---
const careerValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('message').notEmpty().withMessage('Message is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
  }
];

router.post('/careers/apply', careerValidator, async (req, res) => {
  try {
    const { name, email, position, message, userId } = req.body;
    await CareerApplication.create({ name, email, position, message, user: userId });
    return res.json({ success: true, message: 'Application submitted successfully' });
  } catch (err) {
    console.error('❌ Error submitting career application:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
});

router.get('/careers/applications', async (req, res) => {
  try {
    const { userId } = req.query;
    const apps = await CareerApplication.find({ user: userId });
    return res.json({ success: true, applications: apps });
  } catch (err) {
    console.error('❌ Error fetching career applications:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

// --- Blogs ---
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find();
    return res.json({ success: true, blogs });
  } catch (err) {
    console.error('❌ Error fetching blogs:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
  }
});

const bookmarkValidator = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('blogId').notEmpty().withMessage('Blog ID is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
  }
];

router.post('/blogs/bookmark', bookmarkValidator, async (req, res) => {
  try {
    const { userId, blogId } = req.body;
    await User.updateOne({ _id: userId }, { $addToSet: { bookmarks: blogId } });
    return res.json({ success: true, message: 'Blog bookmarked' });
  } catch (err) {
    console.error('❌ Error bookmarking blog:', err);
    return res.status(500).json({ success: false, message: 'Failed to bookmark blog' });
  }
});

router.delete('/blogs/bookmark', bookmarkValidator, async (req, res) => {
  try {
    const { userId, blogId } = req.body;
    await User.updateOne({ _id: userId }, { $pull: { bookmarks: blogId } });
    return res.json({ success: true, message: 'Blog unbookmarked' });
  } catch (err) {
    console.error('❌ Error unbookmarking blog:', err);
    return res.status(500).json({ success: false, message: 'Failed to unbookmark blog' });
  }
});

router.get('/blogs/bookmarks', async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId).populate('bookmarks');
    return res.json({ success: true, bookmarks: user?.bookmarks || [] });
  } catch (err) {
    console.error('❌ Error fetching bookmarks:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch bookmarks' });
  }
});

// --- Stores ---
router.get('/stores', async (req, res) => {
  try {
    const stores = await Store.find();
    return res.json({ success: true, stores });
  } catch (err) {
    console.error('❌ Error fetching stores:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch stores' });
  }
});

// --- FAQs ---
const faqAskValidator = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('question').notEmpty().withMessage('Question is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
  }
];

router.post('/faqs/ask', faqAskValidator, async (req, res) => {
  try {
    const { userId, question } = req.body;
    await FAQQuestion.create({ user: userId, question });
    return res.json({ success: true, message: 'Question submitted successfully' });
  } catch (err) {
    console.error('❌ Error submitting FAQ question:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit question' });
  }
});

router.get('/faqs/user', async (req, res) => {
  try {
    const { userId } = req.query;
    const questions = await FAQQuestion.find({ user: userId });
    return res.json({ success: true, questions });
  } catch (err) {
    console.error('❌ Error fetching user FAQ questions:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch questions' });
  }
});

router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find();
    return res.json({ success: true, faqs });
  } catch (err) {
    console.error('❌ Error fetching FAQs:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch FAQs' });
  }
});

module.exports = router; 