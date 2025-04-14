import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Customer, User } from "./state.interface";
import { PURGE } from "redux-persist";

interface AuthState {
  session: User | null;
  customerSession: Customer | null;
  isCustomerApp: boolean;
}

const initialState: AuthState = {
  session: null,
  customerSession: null,
  isCustomerApp: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<User>) => {
      if (!action.payload) return;
      state.session = action.payload;
    },
    signInForCustomer: (state, action: PayloadAction<Customer>) => {
      if (!action.payload) return;
      state.customerSession = action.payload;
    },
    signOut: (state) => {
      state.session = null;
    },
    signOutForCustomer: (state) => {
      state.customerSession = null;
    },
    setCustomerApp: (state, action: PayloadAction<boolean>) => {
      state.isCustomerApp = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

export const {
  signIn,
  signOut,
  signInForCustomer,
  signOutForCustomer,
  setCustomerApp,
} = authSlice.actions;
export default authSlice.reducer;
