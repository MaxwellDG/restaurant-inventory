import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { productsApi } from './products/apiSlice';

const appReducer = combineReducers({
  auth: authReducer,
  products: productsApi.reducer
});

const persistConfig = {
  key: 'root'
};

const reducerWithReset = (state: any, action: any) => {
  return appReducer(state, action);
};

export type RootState = ReturnType<typeof reducerWithReset>;

export default persistReducer<RootState>(persistConfig, reducerWithReset);
