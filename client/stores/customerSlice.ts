import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { Cart, Customer, MenuItem } from "./state.interface";
import { PURGE } from "redux-persist";

interface CustomerState {
  user: Customer | null;
  cart: Cart;
  menu: MenuItem[];
}

// Initial state
const initialState: CustomerState = {
  user: null,
  cart: { items: [], total: 0 },
  menu: [],
};

// Create Slice
export const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    updateMenu: (state, action: PayloadAction<MenuItem[]>) => {
      if (!_.get(action, "payload")) return;
      state.menu = action.payload;
    },

    updateCart: (state, action: PayloadAction<Cart>) => {
      if (!_.get(action, "payload")) return;
      state.cart = action.payload;
    },

    updateCustomer: (state, action: PayloadAction<Customer | null>) => {
      if (!_.get(action, "payload")) return;
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

// Action creators
export const { updateMenu, updateCart, updateCustomer } = customerSlice.actions;

export default customerSlice.reducer;
