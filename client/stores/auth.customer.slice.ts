import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { Customer } from "./state.interface";

interface AuthState {
  session: Customer | null;
  clientId: string;
}

const initialState: AuthState = {
  session: null,
  clientId: uuidv4(),
};

const authCustomerSlice = createSlice({
  name: "authCustomer",
  initialState,
  reducers: {
    signInForCustomer: (
      state,
      action: PayloadAction<{
        customer: Customer;
        clientId: string;
      }>,
    ) => {
      if (!action.payload) return;
      state.session = action.payload.customer;
      state.clientId = action.payload.clientId;
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
