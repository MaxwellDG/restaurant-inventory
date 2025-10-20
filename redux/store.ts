import { configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import persistStore from "redux-persist/es/persistStore";
import { authApi } from "./auth/apiSlice";
import { exportApi } from "./export/apiSlice";
import { ordersApi } from "./orders/apiSlice";
import { productsApi } from "./products/apiSlice";
import rootReducer from "./reducer";

const rootStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        warnAfter: 128,
      },
      immutableCheck: { warnAfter: 128 },
    })
      .concat(authApi.middleware)
      .concat(productsApi.middleware)
      .concat(ordersApi.middleware)
      .concat(exportApi.middleware);

    return middleware;
  },
});

export const persistor = persistStore(rootStore, null);

export default rootStore;
