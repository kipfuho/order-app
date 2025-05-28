import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { listenerMiddleware } from "./listenerMiddleware";
import authReducer from "./authSlice";
import settingReducer from "./appSetting.slice";
import shopReducer from "./shop.slice";
import customerReducer from "./customerSlice";
import awsReducer from "./awsSlice";
import { shopApiSlice } from "./apiSlices/shopApi.slice";
import { dishApiSlice } from "./apiSlices/dishApi.slice";
import { tableApiSlice } from "./apiSlices/tableApi.slice";
import { orderApiSlice } from "./apiSlices/orderApi.slice";
import { staffApiSlice } from "./apiSlices/staffApi.slice";
import { cartApiSlice } from "./apiSlices/cartApi.slice";
import { kitchenApiSlice } from "./apiSlices/kitchenApi.slice";

// Create a persisted reducer
const persistedAuthReducer = persistReducer(
  {
    key: "persist:auth",
    storage: AsyncStorage,
  },
  authReducer,
);
const persistedCustomerReducer = persistReducer(
  {
    key: "persist:customer",
    storage: AsyncStorage,
  },
  customerReducer,
);
const persistedSettingReducer = persistReducer(
  {
    key: "persist:setting",
    storage: AsyncStorage,
  },
  settingReducer,
);

// Combine reducers
const rootReducer = combineReducers({
  auth: persistedAuthReducer, // Persistent
  setting: persistedSettingReducer, // Persistent
  shop: shopReducer, // Non-persistent
  customer: persistedCustomerReducer, // Persistent
  aws: awsReducer, // Non-persistent
  [shopApiSlice.reducerPath]: shopApiSlice.reducer,
  [dishApiSlice.reducerPath]: dishApiSlice.reducer,
  [tableApiSlice.reducerPath]: tableApiSlice.reducer,
  [orderApiSlice.reducerPath]: orderApiSlice.reducer,
  [staffApiSlice.reducerPath]: staffApiSlice.reducer,
  [cartApiSlice.reducerPath]: cartApiSlice.reducer,
  [kitchenApiSlice.reducerPath]: kitchenApiSlice.reducer,
});

// Create the store
const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Ignore serialization warnings
    })
      .prepend(listenerMiddleware.middleware)
      .concat(shopApiSlice.middleware)
      .concat(dishApiSlice.middleware)
      .concat(tableApiSlice.middleware)
      .concat(orderApiSlice.middleware)
      .concat(staffApiSlice.middleware)
      .concat(cartApiSlice.middleware)
      .concat(kitchenApiSlice.middleware),
});

// Create persistor
export const persistor = persistStore(store);

export const clearPersistedStorage = async () => {
  await persistor.purge();
};

// Define State
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
