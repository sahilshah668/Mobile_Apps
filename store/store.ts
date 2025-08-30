import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import notificationReducer from './notificationSlice';
import orderReducer from './orderSlice';
import productReducer from './productSlice';
import reviewReducer from './reviewSlice';
import userReducer from './userSlice';
import addressReducer from './addressSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    notifications: notificationReducer,
    review: reviewReducer,
    address: addressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 