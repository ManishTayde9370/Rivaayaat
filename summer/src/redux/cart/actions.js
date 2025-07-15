import axios from 'axios';
import { serverEndpoint } from '../../components/config';

// Action types
export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const CLEAR_CART = 'CLEAR_CART';
export const SET_CART = 'SET_CART';

// Action creators
export const addToCart = (product) => ({
  type: ADD_TO_CART,
  payload: product,
});

export const removeFromCart = (productId) => ({
  type: REMOVE_FROM_CART,
  payload: productId,
});

export const clearCart = () => ({
  type: CLEAR_CART,
});

export const setCart = (items) => ({
  type: SET_CART,
  payload: items,
});

// 🔁 Load cart from backend after login or refresh
export const fetchCartFromBackend = () => async (dispatch) => {
  try {
    const res = await axios.get(`${serverEndpoint}/api/cart`, {
      withCredentials: true,
    });
    dispatch(setCart(res.data.cart || []));
  } catch (err) {
    console.error('Failed to load cart:', err);
    dispatch(setCart([])); // fallback to empty cart
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

    // 🧪 Debug log
    console.log('📤 Saving cart to backend:', cartItems);

    // ✅ Save to backend
    await axios.put(
      `${serverEndpoint}/api/cart`,
      { items: cartItems },
      { withCredentials: true }
    );

  } catch (err) {
    console.error('❌ Error saving cart to backend:', err);
  }
};

