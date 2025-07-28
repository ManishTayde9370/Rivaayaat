const express = require('express');
const { body } = require('express-validator');
const authController = require('../controller/authController');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator');

const router = express.Router();

// ✅ Login validation middleware
const loginValidator = [
  body('identity')
    .notEmpty().withMessage('Identity is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// ✅ Register validation middleware
const registerValidator = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name')
    .notEmpty().withMessage('Name is required'),
];

// ✅ Profile update validation middleware
const profileUpdateValidator = [
  body('name')
    .optional()
    .notEmpty().withMessage('Name cannot be empty'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]*$/).withMessage('Invalid phone number format'),
];

// Rate limiters - Updated for development
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (increased from 5)
  message: 'Too many login attempts, please try again later.',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 registration attempts per hour (increased from 3)
  message: 'Too many registration attempts, please try again later.',
});

// ✅ Register
router.post('/register', registerLimiter, registerValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  authController.register(req, res);
});

// ✅ Login
router.post('/login', loginLimiter, loginValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  authController.login(req, res);
});

// ✅ Google Login
router.post('/google-login', authController.googleLogin);

// ✅ Logout
router.post('/logout', authController.logout);

// ✅ Check if user is logged in - No rate limiting for this endpoint
router.get('/is-user-logged-in', authController.isUserLoggedIn);

// ✅ Update user profile
router.patch('/me', requireAuth, profileUpdateValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    await authController.updateProfile(req, res);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
});

module.exports = router;