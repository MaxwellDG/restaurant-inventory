import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./auth/apiSlice";
import authReducer from "./auth/reducer";
import { exportApi } from "./export/apiSlice";
import { ordersApi } from "./orders/apiSlice";
import { productsApi } from "./products/apiSlice";
import { userApi } from "./user/apiSlice";

const rootStore = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [exportApi.reducerPath]: exportApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 128,
      },
      immutableCheck: { warnAfter: 128 },
    })
      .concat(authApi.middleware)
      .concat(productsApi.middleware)
      .concat(ordersApi.middleware)
      .concat(exportApi.middleware)
      .concat(userApi.middleware);
  },
});

export type RootState = ReturnType<typeof rootStore.getState>;
export type AppDispatch = typeof rootStore.dispatch;

export default rootStore;
