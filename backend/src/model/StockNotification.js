const mongoose = require('mongoose');

const stockNotificationSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String },
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate subscriptions for same product + email
stockNotificationSchema.index({ product: 1, email: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true } } });

const StockNotification = mongoose.model('StockNotification', stockNotificationSchema);
module.exports = StockNotification;
