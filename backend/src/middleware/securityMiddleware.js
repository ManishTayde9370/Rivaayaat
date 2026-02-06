const rateLimit = require('express-rate-limit');

// ✅ Rate limiting for different endpoints
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// ✅ Security middleware configuration
const securityMiddleware = {
  // 🛡️ General API rate limiting
  apiLimiter: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    1000, // 1000 requests per window (increased for development)
    'Too many requests from this IP, please try again later.'
  ),

  // 🔐 Auth endpoints rate limiting
  authLimiter: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    50, // 50 requests per window (increased from 5)
    'Too many authentication attempts, please try again later.'
  ),

  // 📝 Registration rate limiting
  registerLimiter: createRateLimit(
    60 * 60 * 1000, // 1 hour
    10, // 10 registration attempts per hour (increased from 3)
    'Too many registration attempts, please try again later.'
  ),

  // 🛒 Cart operations rate limiting
  cartLimiter: createRateLimit(
    1 * 60 * 1000, // 1 minute
    100, // 100 cart operations per minute (increased from 30)
    'Too many cart operations, please slow down.'
  ),

  // 💳 Payment rate limiting
  paymentLimiter: createRateLimit(
    5 * 60 * 1000, // 5 minutes
    10, // 10 payment attempts per 5 minutes (increased from 3)
    'Too many payment attempts, please try again later.'
  ),

  // 🛡️ Input sanitization middleware
  sanitizeInput: (req, res, next) => {
    // Sanitize string inputs
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      return str
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .substring(0, 1000); // Limit length
    };

    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeString(req.body[key]);
        }
      });
    }

    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeString(req.query[key]);
        }
      });
    }

    next();
  },

  // 🛡️ Request size limiting
  requestSizeLimit: (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'], 10);
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        message: 'Request entity too large',
      });
    }

    next();
  },

  // 🛡️ CORS configuration
  corsConfig: (() => {
    // Use a single origin string in production. Do NOT allow multiple origins or '*'.
    const allowedOrigin = process.env.NODE_ENV === 'production'
      ? (process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.trim() : 'https://rivaayaat.netlify.app')
      : 'http://localhost:3000';

    return {
      origin: allowedOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie'],
      exposedHeaders: [],
      optionsSuccessStatus: 200,
    };
  })(),

  // 🛡️ Helmet configuration
  helmetConfig: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://accounts.google.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.razorpay.com", "https://accounts.google.com", "https://oauth2.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        frameSrc: ["'self'", "https://checkout.razorpay.com", "https://accounts.google.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },

  // 🛡️ Error handling middleware
  /* eslint-disable-next-line no-unused-vars */
  errorHandler: (err, req, res, next) => {
    console.error('❌ Error:', err);

    // Handle specific error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(err.errors).map(e => e.message),
      });
    }

    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate entry found',
      });
    }

    // Default error response
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
    });
  },

  // 🛡️ 404 handler
  notFoundHandler: (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  },
};

module.exports = securityMiddleware; 