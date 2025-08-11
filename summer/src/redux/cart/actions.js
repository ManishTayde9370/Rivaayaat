import axios from 'axios';
import { serverEndpoint } from '../../components/config';
import { cartNotifications } from '../../utils/notifications';

// Action types
export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const CLEAR_CART = 'CLEAR_CART';
export const SET_CART = 'SET_CART';
export const SET_CART_LOADING = 'SET_CART_LOADING';

// Helper function to validate cart item
const validateCartItem = (item) => {
  if (!item) {
    console.log('Validation failed: item is null/undefined');
    return false;
  }
  
  const requiredFields = ['name', 'price'];
  const hasId = item._id || item.productId;
  const hasRequiredFields = requiredFields.every(field => 
    item[field] !== undefined && item[field] !== null && item[field] !== ''
  );
  
  const hasValidPrice = typeof item.price === 'number' && item.price >= 0;
  const hasValidQuantity = typeof item.quantity === 'number' && item.quantity > 0 && item.quantity <= 100;
  
  const isValid = hasId && hasRequiredFields && hasValidPrice && hasValidQuantity;
  
  if (!isValid) {
    console.log('Validation failed for item:', {
      item,
      hasId,
      hasRequiredFields,
      hasValidPrice,
      hasValidQuantity,
      missingFields: requiredFields.filter(field => !item[field] || item[field] === '')
    });
  }
  
  return isValid;
};

// Helper function to normalize cart item
const normalizeCartItem = (item) => ({
  ...item,
  productId: item.productId || item._id,
  quantity: Math.max(1, Math.min(100, parseInt(item.quantity) || 1)),
  price: parseFloat(item.price) || 0,
  name: item.name || 'Unknown Product',
  image: item.image || item.images?.[0] || '',
});

// Action creators
export const addToCart = (product) => {
  const normalized = normalizeCartItem(product);
  console.log('Adding to cart:', { original: product, normalized });
  return {
    type: ADD_TO_CART,
    payload: normalized,
  };
};

export const removeFromCart = (productId) => ({
  type: REMOVE_FROM_CART,
  payload: productId,
});

// 🗑️ Clear cart from frontend state
export const clearCart = () => ({
  type: CLEAR_CART,
});

// 🗑️ Clear cart from backend and frontend
export const clearCartFromBackend = () => async (dispatch) => {
  try {
    await axios.delete(`${serverEndpoint}/api/cart`, { withCredentials: true });
    dispatch(clearCart());
    cartNotifications.cleared();
  } catch (err) {
    console.error('Failed to clear cart from backend:', err);
    // Still clear frontend state even if backend fails
    dispatch(clearCart());
    cartNotifications.clearError();
  }
};

export const setCart = (items) => ({
  type: SET_CART,
  payload: items,
});

export const setCartLoading = (loading) => ({
  type: SET_CART_LOADING,
  payload: loading,
});

// 🔁 Load cart from backend after login or refresh
export const fetchCartFromBackend = () => async (dispatch) => {
  dispatch(setCartLoading(true));
  try {
    const res = await axios.get(`${serverEndpoint}/api/cart`, {
      withCredentials: true,
    });
    
    // Validate and normalize cart items from backend
    const validItems = (res.data.items || [])
      .filter(validateCartItem)
      .map(normalizeCartItem);
    
    if (validItems.length !== (res.data.items || []).length) {
      console.warn('Some invalid cart items were filtered out');
    }
    
    dispatch(setCart(validItems));
  } catch (err) {
    console.error('Failed to load cart:', err);
    if (err.response?.status === 401) {
      // User not logged in, set empty cart
      dispatch(setCart([]));
    } else {
      cartNotifications.loadError();
      // Set empty cart on error to prevent undefined state
      dispatch(setCart([]));
    }
  } finally {
    dispatch(setCartLoading(false));
  }
};

// 💾 Save cart to backend after cart updates
export const persistCartToBackend = () => async (dispatch, getState) => {
  try {
    const rawCartItems = getState().cart.items;
    console.log('Raw cart items:', rawCartItems);

    // 🔧 Validate and construct items with required fields
    const validCartItems = rawCartItems
      .filter(validateCartItem)
      .map((item) => ({
        productId: item.productId || item._id,
        name: item.name || 'Unknown Product',
        price: parseFloat(item.price) || 0,
        quantity: Math.max(1, Math.min(100, parseInt(item.quantity) || 1)),
        image: item.image || item.images?.[0] || '',
      }));

    console.log('Valid cart items:', validCartItems);

    if (validCartItems.length !== rawCartItems.length) {
      console.warn('⚠️ Some invalid cart items were excluded from save');
      console.log('Invalid items:', rawCartItems.filter(item => !validateCartItem(item)));
      // Update frontend state to match what we're saving
      dispatch(setCart(validCartItems));
    }

    if (validCartItems.length === 0) {
      console.log('No valid items to save');
      return;
    }

    console.log('Saving cart items:', validCartItems);
    await axios.put(`${serverEndpoint}/api/cart`, { items: validCartItems }, { withCredentials: true });
  } catch (err) {
    console.error('Failed to save cart:', err);
    if (err.response?.status === 401) {
      // User not authenticated, clear cart
      dispatch(clearCart());
    } else {
      cartNotifications.saveError();
    }
  }
};

// 🛒 Add to cart with validation and persistence
export const addToCartWithValidation = (product) => async (dispatch, getState) => {
  try {
    // Normalize product data first
    const normalizedProduct = normalizeCartItem(product);
    
    // Validate product before adding
    if (!validateCartItem(normalizedProduct)) {
      console.error('Invalid product data:', normalizedProduct);
      cartNotifications.addError('Invalid product data');
      return;
    }
    
    // Check current cart state for stock validation
    const currentCart = getState().cart.items;
    const existingItem = currentCart.find(item => 
      (item.productId || item._id) === (normalizedProduct.productId || normalizedProduct._id)
    );
    
    const newQuantity = (existingItem?.quantity || 0) + 1;
    
    // Basic stock check (should be validated on backend as well)
    if (normalizedProduct.stock && newQuantity > normalizedProduct.stock) {
      cartNotifications.stockError(normalizedProduct.name, normalizedProduct.stock);
      return;
    }
    
    // Add to frontend state first
    dispatch(addToCart(normalizedProduct));
    
    // Show success notification
    cartNotifications.added(normalizedProduct.name);
    
    // Persist to backend
    await dispatch(persistCartToBackend());
  } catch (err) {
    console.error('Failed to add to cart:', err);
    cartNotifications.addError();
  }
};

// 🗑️ Remove from cart with persistence
export const removeFromCartWithPersistence = (productId) => async (dispatch) => {
  try {
    // Remove from frontend state first
    dispatch(removeFromCart(productId));
    
    // Persist to backend
    await dispatch(persistCartToBackend());
  } catch (err) {
    console.error('Failed to remove from cart:', err);
    cartNotifications.removeError();
  }
};

