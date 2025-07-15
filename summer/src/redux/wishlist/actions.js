import axios from 'axios';

export const toggleWishlist = (productId) => async (dispatch, getState) => {
  try {
    await axios.post(`http://localhost:5000/api/wishlist/${productId}`, {}, { withCredentials: true });

    const res = await axios.get('http://localhost:5000/api/wishlist', { withCredentials: true });

    dispatch({
      type: 'SET_WISHLIST',
      payload: res.data,
    });
  } catch (err) {
    console.error('Wishlist error:', err);
  }
};
