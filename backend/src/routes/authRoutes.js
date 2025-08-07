const express = require('express');
const { body } = require('express-validator');
const authController = require('../controller/authController');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/authMiddleware');
const { validationResult, body } = require('express-validator');
const User = require('../model/Users'); // Added missing import for User model

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
router.patch('/me', 
  requireAuth,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('phone')
      .optional({ nullable: true, checkFalsy: true })
      .isMobilePhone('any')
      .withMessage('Please provide a valid phone number'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { name, email, phone } = req.body;
      const userId = req.user._id;

      // Check if email is already taken by another user
      if (email !== req.user.email) {
        const existingUser = await User.findOne({ 
          email: email,
          _id: { $ne: userId } 
        });
        
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Email is already registered to another account',
          });
        }
      }

      // Check if phone is already taken by another user
      if (phone && phone !== req.user.phone) {
        const existingPhone = await User.findOne({ 
          phone: phone,
          _id: { $ne: userId } 
        });
        
        if (existingPhone) {
          return res.status(409).json({
            success: false,
            message: 'Phone number is already registered to another account',
          });
        }
      }

      // Update user profile
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          name: name.trim(),
          email: email.toLowerCase(),
          phone: phone || null,
        },
        { 
          new: true, 
          runValidators: true,
          select: '-password' // Don't return password
        }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          isAdmin: updatedUser.isAdmin,
        },
      });

    } catch (error) {
      console.error('Profile update error:', error);
      
      // Handle specific MongoDB errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(409).json({
          success: false,
          message: `${field} is already taken`,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Server error while updating profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }
);

module.exports = router;