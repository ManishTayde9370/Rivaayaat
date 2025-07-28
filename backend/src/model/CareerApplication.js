const mongoose = require('mongoose');

const careerApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  position: { type: String, required: true },
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Submitted' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CareerApplication', careerApplicationSchema); 