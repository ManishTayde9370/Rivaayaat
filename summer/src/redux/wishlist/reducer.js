const initialState = {
  items: [],
};

export default function wishlistReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_WISHLIST':
      return { ...state, items: action.payload };
    default:
      return state;
  }
}
