import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import customerReducer from "./customerSlice";
import awsReducer from "./awsSlice";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { combineReducers } from "redux";

// Configure persistence
const persistConfig = {
  key: "root",
  storage: AsyncStorage, // Stores data in AsyncStorage (React Native) or localStorage (Web)
};

// Create a persisted reducer
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// Combine reducers
const rootReducer = combineReducers({
  auth: persistedAuthReducer, // Persistent
  shop: userReducer, // Non-persistent
  customer: customerReducer, // Non-persistent
  aws: awsReducer, // Non-persistent
});

// Create the store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Ignore serialization warnings
    }),
});

// Create persistor
export const persistor = persistStore(store);

export const clearPersistedStorage = async () => {
  await persistor.purge();
  console.log("Persisted storage wiped!");
};

// Define RootState
export type RootState = ReturnType<typeof store.getState>;

export default store;
