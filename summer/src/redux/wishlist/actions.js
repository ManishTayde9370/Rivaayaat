import axios from 'axios';
import { serverEndpoint } from '../../components/config';
import { wishlistNotifications } from '../../utils/notifications';

// Action types
export const SET_WISHLIST = 'SET_WISHLIST';
export const SET_WISHLIST_LOADING = 'SET_WISHLIST_LOADING';

// Action creators
export const setWishlist = (items) => ({
  type: SET_WISHLIST,
  payload: items,
});

export const setWishlistLoading = (loading) => ({
  type: SET_WISHLIST_LOADING,
  payload: loading,
});

// Toggle wishlist item (add/remove)
export const toggleWishlist = (productId) => async (dispatch, getState) => {
  try {
    dispatch(setWishlistLoading(true));
    
    const response = await axios.post(
      `${serverEndpoint}/api/wishlist/${productId}`, 
      {}, 
      { withCredentials: true }
    );

    if (response.data.success) {
      // Show appropriate notification based on backend response
      if (response.data.action === 'added') {
        wishlistNotifications.added();
      } else if (response.data.action === 'removed') {
        wishlistNotifications.removed();
      }

      // Fetch updated wishlist without showing additional toasts
      await dispatch(fetchWishlistSilent());
    }
  } catch (err) {
    console.error('Wishlist toggle error:', err);
    const errorMessage = err.response?.data?.message || 'Failed to update wishlist';
    wishlistNotifications.updateError(errorMessage);
  } finally {
    dispatch(setWishlistLoading(false));
  }
};

// Remove specific item from wishlist
export const removeFromWishlist = (productId) => async (dispatch) => {
  try {
    dispatch(setWishlistLoading(true));
    
    const response = await axios.delete(
      `${serverEndpoint}/api/wishlist/${productId}`, 
      { withCredentials: true }
    );

    if (response.data.success) {
      wishlistNotifications.removed();
      
      // Fetch updated wishlist without showing additional toasts
      await dispatch(fetchWishlistSilent());
    }
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    const errorMessage = err.response?.data?.message || 'Failed to remove from wishlist';
    wishlistNotifications.updateError(errorMessage);
  } finally {
    dispatch(setWishlistLoading(false));
  }
};

// Fetch wishlist from backend (with error toasts)
export const fetchWishlist = () => async (dispatch) => {
  try {
    dispatch(setWishlistLoading(true));
    
    const response = await axios.get(
      `${serverEndpoint}/api/wishlist`, 
      { withCredentials: true }
    );
    
    dispatch(setWishlist(response.data || []));
  } catch (err) {
    console.error('Fetch wishlist error:', err);
    
    if (err.response?.status === 401) {
      // User not logged in, set empty wishlist
      dispatch(setWishlist([]));
    } else {
      wishlistNotifications.loadError();
      dispatch(setWishlist([]));
    }
  } finally {
    dispatch(setWishlistLoading(false));
  }
};

// Fetch wishlist from backend (silent - no error toasts)
export const fetchWishlistSilent = () => async (dispatch) => {
  try {
    const response = await axios.get(
      `${serverEndpoint}/api/wishlist`, 
      { withCredentials: true }
    );
    
    dispatch(setWishlist(response.data || []));
  } catch (err) {
    console.error('Fetch wishlist error:', err);
    
    if (err.response?.status === 401) {
      // User not logged in, set empty wishlist
      dispatch(setWishlist([]));
    } else {
      // Silent error handling - no toast
      dispatch(setWishlist([]));
    }
  }
};
