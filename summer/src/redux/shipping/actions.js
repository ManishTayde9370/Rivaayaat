// redux/shipping/actions.js (or inside your reducer file if kept together)

export const setShippingAddress = (address) => ({
  type: 'SET_SHIPPING_ADDRESS',
  payload: address,
});
