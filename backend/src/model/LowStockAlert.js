const mongoose = require('mongoose');

const lowStockAlertSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  currentStock: { type: Number, required: true },
  threshold: { type: Number, required: true },
  acknowledged: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const LowStockAlert = mongoose.model('LowStockAlert', lowStockAlertSchema);
module.exports = LowStockAlert;
