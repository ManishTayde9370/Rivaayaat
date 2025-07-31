import { toast } from 'react-toastify';

// 🎯 Centralized Notification System
export const showNotification = {
  // ✅ Success notifications
  success: (message, options = {}) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 2000,
      ...options
    });
  },

  // ℹ️ Info notifications
  info: (message, options = {}) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 2000,
      ...options
    });
  },

  // ⚠️ Warning notifications
  warning: (message, options = {}) => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 3000,
      ...options
    });
  },

  // ❌ Error notifications
  error: (message, options = {}) => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 4000,
      ...options
    });
  }
};

// 🛒 Cart-specific notifications
export const cartNotifications = {
  added: (productName) => showNotification.success(`${productName} added to cart!`),
  removed: (productName) => showNotification.info(`${productName} removed from cart`),
  cleared: () => showNotification.success('✅ Cart cleared successfully'),
  loadError: () => showNotification.error('❌ Failed to load cart. Please refresh the page.'),
  saveError: () => showNotification.error('❌ Failed to save cart to server'),
  clearError: () => showNotification.error('❌ Failed to clear cart from server'),
  addError: (message = 'Failed to add item to cart') => showNotification.error(`❌ ${message}`),
  removeError: () => showNotification.error('❌ Failed to remove item from cart'),
  stockError: (productName, availableStock) => showNotification.warning(`⚠️ Only ${availableStock} ${productName} available in stock`)
};

// ❤️ Wishlist-specific notifications
export const wishlistNotifications = {
  added: () => showNotification.success('✅ Added to wishlist!'),
  removed: () => showNotification.info('🗑️ Removed from wishlist'),
  loadError: () => showNotification.error('❌ Failed to load wishlist'),
  updateError: (message) => showNotification.error(`❌ ${message}`)
};

// 🛍️ Order-specific notifications
export const orderNotifications = {
  placed: () => showNotification.success('✅ Order placed successfully!'),
  paymentSuccess: () => showNotification.success('💳 Payment successful!'),
  paymentFailed: () => showNotification.error('❌ Payment failed. Please try again.'),
  verificationFailed: () => showNotification.error('❌ Payment verification failed. Please contact support.')
};

// 👤 Auth-specific notifications
export const authNotifications = {
  loginSuccess: () => showNotification.success('✅ Login successful!'),
  loginFailed: (message) => showNotification.error(`❌ ${message}`),
  registerSuccess: () => showNotification.success('✅ Registration successful!'),
  registerFailed: (message) => showNotification.error(`❌ ${message}`),
  logoutSuccess: () => showNotification.info('👋 Logged out successfully'),
  profileUpdated: () => showNotification.success('✅ Profile updated successfully'),
  profileError: (message) => showNotification.error(`❌ ${message}`)
};

// ✅ Enhanced notification system for admin actions
export const adminNotifications = {
  // ✅ User management notifications
  userPromoted: () => {
    toast.success('✅ User promoted to admin successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  userBlocked: () => {
    toast.warning('🚫 User blocked successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  userUnblocked: () => {
    toast.success('✅ User unblocked successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  userDeleted: () => {
    toast.success('🗑️ User deleted successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  userError: (message) => {
    toast.error(`❌ ${message}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // ✅ Product management notifications
  productAdded: () => {
    toast.success('✅ Product added successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  productUpdated: () => {
    toast.success('✅ Product updated successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  productDeleted: () => {
    toast.success('🗑️ Product deleted successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  productError: (message) => {
    toast.error(`❌ ${message}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // ✅ Order management notifications
  orderStatusUpdated: () => {
    toast.success('✅ Order status updated successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  orderError: (message) => {
    toast.error(`❌ ${message}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // ✅ Message management notifications
  messageReplied: () => {
    toast.success('✅ Message replied successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  messageDeleted: () => {
    toast.success('🗑️ Message deleted successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  messageError: (message) => {
    toast.error(`❌ ${message}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // ✅ Export notifications
  exportSuccess: (message) => {
    toast.success(`📊 ${message}`, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  exportError: (message) => {
    toast.error(`❌ ${message}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // ✅ Authentication notifications
  loginSuccess: () => {
    toast.success('🔐 Admin login successful!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  loginError: (message) => {
    toast.error(`❌ ${message}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  logoutSuccess: () => {
    toast.info('👋 Logged out successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // ✅ System notifications
  systemError: (message) => {
    toast.error(`💥 ${message}`, {
      position: 'top-right',
      autoClose: 7000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  systemWarning: (message) => {
    toast.warning(`⚠️ ${message}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  systemInfo: (message) => {
    toast.info(`ℹ️ ${message}`, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // ✅ Loading notifications
  loading: (message) => {
    return toast.loading(`⏳ ${message}`, {
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
    });
  },

  // ✅ Update loading notification
  updateLoading: (toastId, message, type = 'success') => {
    toast.update(toastId, {
      render: message,
      type: type,
      isLoading: false,
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // ✅ Dismiss notification
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  // ✅ Clear all notifications
  clearAll: () => {
    toast.dismiss();
  },
};

// ✅ User notifications (for regular users)
export const userNotifications = {
  loginSuccess: () => {
    toast.success('✅ Login successful!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  registerSuccess: () => {
    toast.success('✅ Registration successful!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  logoutSuccess: () => {
    toast.info('👋 Logged out successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  authError: (message) => {
    toast.error(`❌ ${message}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  cartUpdated: () => {
    toast.success('🛒 Cart updated!', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  orderPlaced: () => {
    toast.success('✅ Order placed successfully!', {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  orderError: (message) => {
    toast.error(`❌ ${message}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  messageSent: () => {
    toast.success('📧 Message sent successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  messageError: (message) => {
    toast.error(`❌ ${message}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
};

// 📧 Contact-specific notifications
export const contactNotifications = {
  messageSent: () => showNotification.success('✅ Message sent successfully'),
  messageError: (message) => showNotification.error(`❌ ${message}`)
};

// ✅ Toast configuration
export const toastConfig = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
};

// ✅ Custom toast styles
export const customToastStyles = {
  success: {
    style: {
      background: '#28a745',
      color: 'white',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#28a745',
    },
  },
  error: {
    style: {
      background: '#dc3545',
      color: 'white',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#dc3545',
    },
  },
  warning: {
    style: {
      background: '#ffc107',
      color: '#212529',
    },
    iconTheme: {
      primary: '#212529',
      secondary: '#ffc107',
    },
  },
  info: {
    style: {
      background: '#17a2b8',
      color: 'white',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#17a2b8',
    },
  },
};

export default {
  adminNotifications,
  userNotifications,
  toastConfig,
  customToastStyles,
}; 