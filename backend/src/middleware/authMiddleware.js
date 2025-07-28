const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const secret = process.env.JWT_SECRET || 'your-fallback-secret';
const cookieName = 'token';

// ✅ Rate limiting for admin actions
const adminActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: { success: false, message: 'Too many admin actions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Audit logging function
const logAdminAction = (req, action, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    adminId: req.user?._id,
    adminEmail: req.user?.email,
    action,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    details,
    endpoint: req.originalUrl,
    method: req.method
  };
  
  console.log('🔐 ADMIN ACTION:', JSON.stringify(logEntry, null, 2));
  
  // In production, you'd save this to a database
  // For now, we'll just log it
};

// ✅ Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

// ✅ Utility: Extract token from cookies
const getTokenFromRequest = (req) => req.cookies?.[cookieName];

// ✅ Utility: Verify and decode token with enhanced security
const verifyTokenPayload = (token) => {
  try {
    const decoded = jwt.verify(token, secret);
    const userId = decoded._id || decoded.id;

    if (!userId) {
      throw new Error('Invalid token payload: missing user ID');
    }

    // ✅ Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      throw new Error('Token has expired');
    }

    return { _id: userId, ...decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error('Invalid or corrupted token');
  }
};

const authMiddleware = {
  // ✅ Enhanced middleware: Authenticated users only
  requireAuth: (req, res, next) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.',
      });
    }

    try {
      req.user = verifyTokenPayload(token);
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },

  // ✅ Enhanced middleware: Admins only with audit logging
  requireAdmin: (req, res, next) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in as admin.',
      });
    }

    try {
      const user = verifyTokenPayload(token);

      if (!user.isAdmin) {
        logAdminAction(req, 'UNAUTHORIZED_ACCESS_ATTEMPT', { 
          attemptedAction: req.originalUrl 
        });
        
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      req.user = user;
      
      // ✅ Log admin actions
      if (req.method !== 'GET') {
        logAdminAction(req, 'ADMIN_ACTION', {
          action: req.method,
          endpoint: req.originalUrl
        });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },

  // ✅ Enhanced middleware: Optional user attachment
  optionalAuth: (req, res, next) => {
    const token = getTokenFromRequest(req);

    if (token) {
      try {
        req.user = verifyTokenPayload(token);
      } catch (_) {
        req.user = null; // silently ignore invalid tokens
      }
    }

    next();
  },

  // ✅ Enhanced middleware: Strict auth with 403 on invalid token
  verifyToken: (req, res, next) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    try {
      req.user = verifyTokenPayload(token);
      next();
    } catch (error) {
      return res.status(403).json({
        message: error.message,
      });
    }
  },

  // ✅ New: Input sanitization middleware
  sanitizeInput: (req, res, next) => {
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeInput(req.body[key]);
        }
      });
    }

    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeInput(req.query[key]);
        }
      });
    }

    next();
  },

  // ✅ New: Request size limiting
  limitRequestSize: (req, res, next) => {
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

  // ✅ New: Admin action rate limiting
  adminRateLimit: adminActionLimiter,
};

module.exports = authMiddleware;
