import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import memberReducer from "./memberSlice";



export const store = configureStore({
  reducer: {
    auth: authReducer,
    member: memberReducer,
  },
});
