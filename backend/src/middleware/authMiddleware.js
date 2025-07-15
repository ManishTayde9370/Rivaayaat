const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'your-fallback-secret';
const cookieName = 'token';

// Utility: Extract token from cookies
const getTokenFromRequest = (req) => req.cookies?.[cookieName];

// Utility: Verify and decode token
const verifyTokenPayload = (token) => {
  try {
    const decoded = jwt.verify(token, secret);
    const userId = decoded._id || decoded.id;

    if (!userId) {
      throw new Error('Invalid token payload: missing user ID');
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
  // ✅ Middleware: Authenticated users only
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

  // ✅ Middleware: Admins only
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
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },

  // ✅ Middleware: Optional user attachment
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

  // ✅ Middleware: Strict auth with 403 on invalid token
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
};

module.exports = authMiddleware;
