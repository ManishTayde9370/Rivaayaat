const express = require('express');
const { body } = require('express-validator');
const authController = require('../controller/authController');

const router = express.Router();

// ✅ Login validation middleware
const loginValidator = [
  body('identity')
    .notEmpty().withMessage('Identity is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// You can also define `registerValidator` if needed later

// ✅ Routes
router.post('/login', loginValidator, authController.login);
router.post('/register', authController.register);
router.post('/google-login', authController.googleLogin);
router.post('/logout', authController.logout);
router.get('/is-user-logged-in', authController.isUserLoggedIn);

module.exports = router;