const express = require('express');
const router = express.Router();
const contactController = require('../controller/contactController');
const { requireAdmin, requireAuth } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const ContactMessage = require('../model/ContactMessage');

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

// Admin: Get all contact messages
router.get('/messages', requireAdmin, contactController.getAllContactMessages);

// Admin: Delete a contact message by ID
router.delete('/messages/:id', requireAdmin, contactController.deleteContactMessage);

module.exports = router; 