import axios from 'axios';
import { serverEndpoint } from '../../components/config';
import { cartNotifications } from '../../utils/notifications';

// Action types
export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const CLEAR_CART = 'CLEAR_CART';
export const SET_CART = 'SET_CART';
export const SET_CART_LOADING = 'SET_CART_LOADING';

// Action creators
export const addToCart = (product) => ({
  type: ADD_TO_CART,
  payload: product,
});

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
    dispatch(setCart(res.data.items || []));
  } catch (err) {
    console.error('Failed to load cart:', err);
    if (err.response?.status === 401) {
      // User not logged in, set empty cart
      dispatch(setCart([]));
    } else {
      cartNotifications.loadError();
    }
  } finally {
    dispatch(setCartLoading(false));
  }
};

// 💾 Save cart to backend after cart updates
export const persistCartToBackend = () => async (dispatch, getState) => {
  try {
    const rawCartItems = getState().cart.items;

    // 🔧 Construct items with required fields
    const cartItems = rawCartItems.map((item) => ({
      productId: item.productId || item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    // ❗ Validate each item before sending to backend
    const invalidItems = cartItems.filter(
      (item) =>
        !item.productId ||
        typeof item.name !== 'string' ||
        typeof item.price !== 'number' ||
        typeof item.quantity !== 'number'
    );

    if (invalidItems.length > 0) {
      console.warn('⚠️ Skipping save. Invalid cart items found:', invalidItems);
      return;
    }

    await axios.put(`${serverEndpoint}/api/cart`, { items: cartItems }, { withCredentials: true });
  } catch (err) {
    console.error('Failed to save cart:', err);
    cartNotifications.saveError();
  }
};

// 🛒 Add to cart with validation and persistence
export const addToCartWithValidation = (product) => async (dispatch, getState) => {
  try {
    // Add to frontend state first
    dispatch(addToCart(product));
    
    // Show success notification
    cartNotifications.added(product.name);
    
    // Persist to backend
    await dispatch(persistCartToBackend());
  } catch (err) {
    console.error('Failed to add to cart:', err);
    cartNotifications.saveError();
  }
};

