import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducer/rootReducer';

const store = configureStore({
  reducer: rootReducer,
});

export default store;