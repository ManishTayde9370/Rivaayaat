// Development startup script
require('dotenv').config();

// Set default environment variables for development if not present
process.env.PORT = process.env.PORT || 5000;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rivaayat';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production';
// For development, use test keys if available, otherwise provide helpful error
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy';
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';

// Log payment configuration status
if (process.env.RAZORPAY_KEY_ID === 'rzp_test_dummy') {
  console.log('⚠️  Payment Gateway: Using dummy credentials - payment features will not work');
  console.log('💡 To enable payments, set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
}
// Google OAuth configuration
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '123456789-abcdefghijklmnop.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_client_secret';

// Log OAuth configuration status
if (process.env.GOOGLE_CLIENT_ID === '123456789-abcdefghijklmnop.apps.googleusercontent.com') {
  console.log('⚠️  Google OAuth: Using dummy credentials - OAuth features will not work');
  console.log('💡 To enable Google OAuth, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file');
}
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dummy_cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'dummy_key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'dummy_secret';

console.log('🚀 Starting development server with default configuration...');
console.log('📊 Environment:', process.env.NODE_ENV);
console.log('🔗 Port:', process.env.PORT);
console.log('🗄️  MongoDB URI:', process.env.MONGO_URI);

// Start the server
require('./server.js');
