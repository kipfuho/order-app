import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import settingReducer from "./appSetting.slice";
import shopReducer from "./shop.slice";
import customerReducer from "./customerSlice";
import awsReducer from "./awsSlice";
import { shopApiSlice } from "./apiSlices/shopApi.slice";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { combineReducers } from "redux";
import { listenerMiddleware } from "./listenerMiddleware";
import { dishApiSlice } from "./apiSlices/dishApi.slice";
import { tableApiSlice } from "./apiSlices/tableApi.slice";
import { orderApiSlice } from "./apiSlices/orderApi.slice";

// Configure persistence
const persistConfig = {
  key: "root",
  storage: AsyncStorage, // Stores data in AsyncStorage (React Native) or localStorage (Web)
};

// Create a persisted reducer
const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedSettingReducer = persistReducer(persistConfig, settingReducer);

// Combine reducers
const rootReducer = combineReducers({
  auth: persistedAuthReducer, // Persistent
  setting: persistedSettingReducer, // Persistent
  shop: shopReducer, // Non-persistent
  customer: customerReducer, // Non-persistent
  aws: awsReducer, // Non-persistent
  [shopApiSlice.reducerPath]: shopApiSlice.reducer,
  [dishApiSlice.reducerPath]: dishApiSlice.reducer,
  [tableApiSlice.reducerPath]: tableApiSlice.reducer,
  [orderApiSlice.reducerPath]: orderApiSlice.reducer,
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
      .concat(orderApiSlice.middleware),
});

// Create persistor
export const persistor = persistStore(store);

export const clearPersistedStorage = async () => {
  await persistor.purge();
  console.log("Persisted storage wiped!");
};

// Define State
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
