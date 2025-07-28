const mongoose = require('mongoose');

const artisanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  photo: {
    type: String, // URL or path to photo
    trim: true,
  },
  social: {
    website: { type: String, trim: true },
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Artisan = mongoose.model('Artisan', artisanSchema);
module.exports = Artisan; 