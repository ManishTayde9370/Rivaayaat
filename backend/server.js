require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const securityMiddleware = require('./src/middleware/securityMiddleware');

const app = express();

// In dev behind proxies (WSL/Reverse Proxy), trust X-Forwarded-* headers for rate limit to work
if (process.env.NODE_ENV !== 'production') {
  app.set('trust proxy', 1);
}

// 🔗 Routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const adminProductRoutes = require('./src/routes/adminProductRoutes');
const publicProductRoutes = require('./src/routes/publicProductRoutes');
const publicRoutes = require('./src/routes/publicRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const checkoutRoutes = require('./src/routes/checkoutRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

// 🧱 Security Middleware
app.use(helmet(securityMiddleware.helmetConfig));
app.use(cors(securityMiddleware.corsConfig));
app.use(securityMiddleware.requestSizeLimit);
app.use(securityMiddleware.sanitizeInput);

// 🧱 Basic Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// app.use(morgan('combined')); // Commented out to reduce terminal output

// 🛡️ Rate Limiting
app.use('/api/auth', securityMiddleware.authLimiter);
app.use('/api/cart', securityMiddleware.cartLimiter);
app.use('/api/checkout', securityMiddleware.paymentLimiter);
app.use('/api', securityMiddleware.apiLimiter);

// 📁 Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔗 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/products', publicProductRoutes);
app.use('/api', publicRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/contact', contactRoutes);

// 🛡️ 404 Handler
app.use(securityMiddleware.notFoundHandler);

// 🛡️ Error Handler
app.use(securityMiddleware.errorHandler);

// 🔌 Socket.IO Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});

const userSockets = new Map();

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    if (userId) userSockets.set(userId, socket.id);
  });
  
  socket.on('disconnect', () => {
    for (const [userId, id] of userSockets.entries()) {
      if (id === socket.id) userSockets.delete(userId);
    }
  });
});

app.set('io', io);
app.set('userSockets', userSockets);

// 🔗 Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Rivaayaat';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Make sure MongoDB is running or install MongoDB locally');
    console.log('💡 You can also use MongoDB Atlas (cloud) by setting MONGO_URI in .env file');
    
    // For development, start server anyway with a warning
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Starting server in development mode without database...');
      server.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT} (without database)`);
      });
    } else {
      process.exit(1);
    }
  });

// 🛡️ Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');

  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
