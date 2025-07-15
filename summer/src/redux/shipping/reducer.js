const initialState = {
  address: null,
};

const shippingReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_SHIPPING_ADDRESS':
      return {
        ...state,
        address: action.payload,
      };
    default:
      return state;
  }
};

export default shippingReducer;
