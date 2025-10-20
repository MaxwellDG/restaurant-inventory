import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import { authApi } from "./auth/apiSlice";
import authReducer from "./auth/slice";
import { exportApi } from "./export/apiSlice";
import { ordersApi } from "./orders/apiSlice";
import { productsApi } from "./products/apiSlice";

const appReducer = combineReducers({
  auth: authReducer,
  authApi: authApi.reducer,
  products: productsApi.reducer,
  orders: ordersApi.reducer,
  export: exportApi.reducer,
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
};

const reducerWithReset = (state: any, action: any) => {
  return appReducer(state, action);
};

export type RootState = ReturnType<typeof reducerWithReset>;

export default persistReducer<RootState>(persistConfig, reducerWithReset);
