const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allows duplicates if not provided (null/undefined)
  },
  password: {
    type: String,
    required: function () {
      return !this.isGoogleUser; // Only required for non-Google users
    }
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false // Normal users are not admins
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  wishlist: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  // Bookmarks: support both Blog and Product in a single array
  bookmarks: [
    {
      kind: {
        type: String,
        enum: ['Blog', 'Product'],
        required: true
      },
      item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'bookmarks.kind'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
