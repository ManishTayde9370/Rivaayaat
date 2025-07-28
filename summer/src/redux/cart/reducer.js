import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  CLEAR_CART,
  SET_CART,
  SET_CART_LOADING,
} from './actions';

const initialState = {
  items: [],
  loading: false,
};

const reducer = (state = initialState, action) => {
  const items = Array.isArray(state.items) ? state.items : [];

  switch (action.type) {
    case ADD_TO_CART: {
      const existingItem = items.find(item => 
        item._id === action.payload._id || 
        item.productId === action.payload.productId ||
        item.productId === action.payload._id
      );
      if (existingItem) {
        return {
          ...state,
          items: items.map(item =>
            item._id === action.payload._id || 
            item.productId === action.payload.productId ||
            item.productId === action.payload._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...items, { ...action.payload, quantity: 1 }],
      };
    }

    case REMOVE_FROM_CART:
      return {
        ...state,
        items: items.filter(item => 
          item._id !== action.payload && 
          item.productId !== action.payload
        ),
      };

    case CLEAR_CART:
      return {
        ...state,
        items: [],
      };

    case SET_CART:
      return {
        ...state,
        items: Array.isArray(action.payload) ? action.payload : [],
      };

    case SET_CART_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
};

export default reducer;