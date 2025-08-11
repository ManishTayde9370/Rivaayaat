# Backend Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables (Optional)

Create a `.env` file in the backend directory for production settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/rivaayat

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The server will connect to `mongodb://localhost:27017/rivaayat`

### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get your connection string
4. Set `MONGO_URI` in your `.env` file

### Option 3: Development Mode (No Database)
- The server will start without database in development mode
- Some features won't work, but the server will run

## Troubleshooting

### Server won't start
- Check if port 5000 is available
- Make sure all dependencies are installed
- Check console for error messages

### Database connection issues
- Ensure MongoDB is running (if using local)
- Check your connection string (if using Atlas)
- The server will start in development mode without database

### Payment issues
- Set up Razorpay test credentials for payment testing
- Without credentials, payment features won't work

## Default Configuration

The server uses these defaults for development:
- Port: 5000
- Database: mongodb://localhost:27017/rivaayat
- JWT Secret: dev-jwt-secret-key-change-in-production
- Environment: development


