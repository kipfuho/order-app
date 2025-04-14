import _ from "lodash";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Cart, CartItem, Customer, Dish, Shop, Table } from "./state.interface";
import { PURGE } from "redux-persist";

interface CustomerState {
  shop: Shop | null;
  table: Table | null;
  user: Customer | null;
  currentCartItem: Record<string, CartItem>;
  currentCartAmount: number;
}

// Initial state
const initialState: CustomerState = {
  shop: null,
  table: null,
  user: null,
  currentCartItem: {},
  currentCartAmount: 0,
};

// Create Slice
export const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    updateShop: (state, action: PayloadAction<Shop>) => {
      if (!action.payload) return;

      state.shop = action.payload;
    },

    updateTable: (state, action: PayloadAction<Table>) => {
      if (!action.payload) return;

      state.table = action.payload;
    },

    updateCurrentCart: (state, action: PayloadAction<Cart>) => {
      if (!_.get(action, "payload")) return;

      state.currentCartItem = _.keyBy(action.payload.cartItems, "dish");
    },

    updateCartSingleDish: (
      state,
      action: PayloadAction<{ dish: Dish; quantity: number }>
    ) => {
      if (!_.get(action, "payload")) return;

      const dish = action.payload.dish;
      const currentCartItem = state.currentCartItem[dish.id];
      state.currentCartItem[dish.id] = {
        ...currentCartItem,
        quantity: action.payload.quantity,
      };
      state.currentCartAmount +=
        (action.payload.quantity - (currentCartItem?.quantity || 0)) *
        dish.price;
    },

    updateCurrentCartAmount: (state, action: PayloadAction<number>) => {
      if (!_.get(action, "payload")) return;

      state.currentCartAmount = action.payload;
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
export const {
  updateShop,
  updateTable,
  updateCurrentCart,
  updateCurrentCartAmount,
  updateCartSingleDish,
  updateCustomer,
} = customerSlice.actions;

export default customerSlice.reducer;
