const express = require('express');
const router = express.Router();
const contactController = require('../controller/contactController');
const { requireAdmin } = require('../middleware/authMiddleware');

// Public: Submit contact message
router.post('/', contactController.submitContactMessage);

// Admin: Get all contact messages
router.get('/messages', requireAdmin, contactController.getAllContactMessages);

// Admin: Delete a contact message by ID
router.delete('/messages/:id', requireAdmin, contactController.deleteContactMessage);

module.exports = router; 