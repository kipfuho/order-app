import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import customerReducer from "./customerSlice";

const store = configureStore({
  reducer: {
    shop: userReducer,
    customer: customerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
