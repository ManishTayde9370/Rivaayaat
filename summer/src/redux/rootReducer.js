import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'; // ✅ remove curly braces

import { userReducer } from './redux/user/reducer';
import cartReducer from './redux/cart/reducer';
import wishlistReducer from './redux/wishlist/reducer';
import shippingReducer from './redux/shipping/reducer';

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  shipping: shippingReducer, // ✅ ADD TO ROOT
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
