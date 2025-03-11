import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import customerReducer from "./customerSlice";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { combineReducers } from "redux";

// Configure persistence
const persistConfig = {
  key: "root",
  storage: AsyncStorage, // Stores data in AsyncStorage (React Native) or localStorage (Web)
};

// Combine reducers
const rootReducer = combineReducers({
  shop: userReducer,
  customer: customerReducer,
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Ignore serialization warnings
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Define RootState
export type RootState = ReturnType<typeof store.getState>;

export default store;
