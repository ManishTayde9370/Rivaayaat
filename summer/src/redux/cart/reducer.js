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

// Helper function to get consistent ID from cart item
const getItemId = (item) => item.productId || item._id;

// Helper function to check if two items are the same product
const isSameProduct = (item1, item2) => {
  const id1 = getItemId(item1);
  const id2 = getItemId(item2);
  return id1 && id2 && id1.toString() === id2.toString();
};

const reducer = (state = initialState, action) => {
  const items = Array.isArray(state.items) ? state.items : [];

  switch (action.type) {
    case ADD_TO_CART: {
      const newItem = action.payload;
      const existingItemIndex = items.findIndex(item => isSameProduct(item, newItem));
      
      if (existingItemIndex !== -1) {
        // Update existing item quantity
        return {
          ...state,
          items: items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
              : item
          ),
        };
      }
      
      // Add new item with consistent ID structure
      const itemToAdd = {
        ...newItem,
        productId: getItemId(newItem), // Ensure productId is always set
        quantity: newItem.quantity || 1,
      };
      
      return {
        ...state,
        items: [...items, itemToAdd],
      };
    }

    case REMOVE_FROM_CART:
      return {
        ...state,
        items: items.filter(item => !isSameProduct(item, { _id: action.payload, productId: action.payload })),
      };

    case CLEAR_CART:
      return {
        ...state,
        items: [],
      };

    case SET_CART:
      // Normalize cart items to ensure consistent structure
      const normalizedItems = Array.isArray(action.payload) 
        ? action.payload.map(item => ({
            ...item,
            productId: getItemId(item), // Ensure productId is always set
          }))
        : [];
      
      return {
        ...state,
        items: normalizedItems,
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