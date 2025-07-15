// ✅ store.js

import { createStore, combineReducers, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk';

import { userReducer } from './redux/user/reducer';
import cartReducer from './redux/cart/reducer';
import wishlistReducer from './redux/wishlist/reducer';
import shippingReducer from './redux/shipping/reducer'; // ✅ Correct path

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  shipping: shippingReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
