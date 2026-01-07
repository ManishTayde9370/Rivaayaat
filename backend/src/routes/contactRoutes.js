const express = require('express');
const router = express.Router();
const contactController = require('../controller/contactController');
const { requireAdmin } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Public: Submit contact message
const contactValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
  }
];

router.post('/', contactValidator, contactController.submitContactMessage);

// Admin: Get all contact messages (return array directly for frontend compatibility)
router.get('/messages', requireAdmin, async (req, res) => {
  try {
    const result = await contactController.getAllContactMessages(req, res);
    // If controller already sent the response, exit
    if (res.headersSent) return;
    // Fallback: ensure array response
    if (result && Array.isArray(result)) {
      return res.json(result);
    }
  } catch (err) {
    console.error('❌ Failed to fetch messages:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to fetch messages.' });
    }
  }
});

// Admin: Delete a contact message by ID
router.delete('/messages/:id', requireAdmin, contactController.deleteContactMessage);

// Admin: Mark a contact message as read
router.patch('/messages/:id/read', requireAdmin, async (req, res) => {
  try {
    const ContactMessage = require('../model/ContactMessage');
    const updated = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { $set: { read: true } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to mark message as read:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark as read.' });
  }
});

module.exports = router; 