import { SET_WISHLIST, SET_WISHLIST_LOADING } from './actions';

const initialState = {
  items: [],
  loading: false,
};

export default function wishlistReducer(state = initialState, action) {
  switch (action.type) {
    case SET_WISHLIST:
      return { 
        ...state, 
        items: action.payload 
      };
    
    case SET_WISHLIST_LOADING:
      return { 
        ...state, 
        loading: action.payload 
      };
    
    default:
      return state;
  }
}
