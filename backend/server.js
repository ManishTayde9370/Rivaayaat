require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// 🔗 Routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const adminProductRoutes = require('./src/routes/adminProductRoutes');
const publicProductRoutes = require('./src/routes/publicProductRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const checkoutRoutes = require('./src/routes/checkoutRoutes');

// 🧱 Middleware
app.use(cors({
  origin: process.env.CLIENT_ENDPOINT || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));

// 🖼 Static file serving (product images, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🌐 MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rivaayat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// 🧭 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/products', publicProductRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/checkout', checkoutRoutes);

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('🌿 Rivaayat Server is running');
});

// ❌ Global Error Handler (optional extension: handle async errors too)
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
