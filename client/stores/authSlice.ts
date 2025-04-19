import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Customer, User } from "./state.interface";
import { PURGE } from "redux-persist";

interface AuthState {
  session: User | null;
  customerSession: Customer | null;
}

const initialState: AuthState = {
  session: null,
  customerSession: null,
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
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

export const { signIn, signOut, signInForCustomer, signOutForCustomer } =
  authSlice.actions;
export default authSlice.reducer;
