# 🚀 Rivaayat E-commerce Setup Guide

## ✅ **Quick Fix for Current Issues**

### 1. **Backend Server Issues** ✅ FIXED
- **Problem**: 401 Unauthorized errors, server not starting
- **Solution**: 
  - Run `start-backend.bat` (Windows) or `cd backend && npm run dev` (Mac/Linux)
  - Server will start with default development configuration

### 2. **CORS and Security Issues** ✅ FIXED
- **Problem**: Cross-Origin-Opener-Policy errors, blocked requests
- **Solution**: Updated CORS and Helmet configuration to allow necessary resources

### 3. **Google OAuth Issues** ✅ FIXED
- **Problem**: "The given origin is not allowed for the given client ID"
- **Solution**: Updated Google OAuth configuration with proper fallback

### 4. **Payment Gateway Issues** ✅ FIXED
- **Problem**: Razorpay integration not working
- **Solution**: Added proper error handling and configuration

## 🛠️ **Setup Instructions**

### **Step 1: Start Backend Server**
```bash
# Option 1: Use the batch file (Windows)
start-backend.bat

# Option 2: Manual start
cd backend
npm install
npm run dev
```

### **Step 2: Start Frontend**
```bash
cd summer
npm install
npm start
```

### **Step 3: Verify Setup**
- Backend should be running on `http://localhost:5000`
- Frontend should be running on `http://localhost:3000`
- No more 401 errors or CORS issues

## 🔧 **Environment Configuration**

### **For Development (Auto-configured)**
The backend automatically uses these default values:
- **Port**: 5000
- **MongoDB**: `mongodb://localhost:27017/rivaayat`
- **JWT Secret**: `dev-jwt-secret-key-change-in-production`
- **Payment Gateway**: Dummy credentials (for testing)

### **For Production**
Create a `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_live_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🗄️ **MongoDB Setup**

### **Option 1: Local MongoDB**
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Create database: `rivaayat`

### **Option 2: MongoDB Atlas (Cloud)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Set `MONGO_URI` in `.env` file

## 🔐 **Payment Gateway Setup**

### **Razorpay Integration**
1. Create account at [Razorpay](https://razorpay.com)
2. Get test API keys from dashboard
3. Set in `.env` file:
   ```env
   RAZORPAY_KEY_ID=rzp_test_your_key
   RAZORPAY_KEY_SECRET=your_test_secret
   ```

## 🔑 **Google OAuth Setup**

### **Google OAuth Configuration**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project and enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized origins: `http://localhost:3000`
5. Set in `.env` file:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Backend Won't Start**
```bash
# Check if MongoDB is running
mongod --version

# Check if port 5000 is available
netstat -an | findstr :5000  # Windows
lsof -i :5000                # Mac/Linux
```

#### **2. Frontend Can't Connect to Backend**
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify `serverEndpoint` in `summer/src/components/config.js`

#### **3. Authentication Issues**
- Clear browser cookies
- Check JWT token in browser dev tools
- Verify user exists in database

#### **4. Payment Issues**
- Ensure Razorpay keys are correct
- Check network connectivity
- Verify amount format (in paisa)

#### **5. Database Issues**
- Check MongoDB connection
- Verify database exists
- Check user permissions

## 📱 **Testing the Application**

### **User Flow Testing**
1. **Registration/Login**: Test user registration and login
2. **Product Browsing**: Browse products, apply filters
3. **Cart Management**: Add/remove items from cart
4. **Checkout Process**: Complete purchase flow
5. **Admin Panel**: Test admin features (if admin user)

### **Admin Testing**
1. **Dashboard**: View analytics and statistics
2. **Product Management**: Add/edit/delete products
3. **Order Management**: Update order status
4. **User Management**: View and manage users

## 🎯 **Expected Behavior After Setup**

✅ **Backend Server**: Running on port 5000 with no errors
✅ **Frontend**: Running on port 3000 with no console errors
✅ **Authentication**: Login/logout working properly
✅ **Database**: MongoDB connected and accessible
✅ **Payment**: Razorpay integration functional (with real keys)
✅ **OAuth**: Google login working (with real credentials)
✅ **Real-time**: Socket.IO connections established

## 📞 **Support**

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check network connectivity and firewall settings

---

**🎉 Your Rivaayat e-commerce platform should now be fully functional!**


