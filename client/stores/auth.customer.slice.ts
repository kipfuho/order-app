import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { Customer } from "./state.interface";

interface AuthState {
  session: Customer | null;
}

const initialState: AuthState = {
  session: null,
};

const authCustomerSlice = createSlice({
  name: "authCustomer",
  initialState,
  reducers: {
    signInForCustomer: (state, action: PayloadAction<Customer>) => {
      if (!action.payload) return;
      state.session = action.payload;
    },
    signOutForCustomer: (state) => {
      state.session = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

export const { signInForCustomer, signOutForCustomer } =
  authCustomerSlice.actions;
export default authCustomerSlice.reducer;
