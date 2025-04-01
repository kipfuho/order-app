import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { Dish, DishOrder, Shop } from "./state.interface";
import { PURGE } from "redux-persist";

interface ShopState {
  currentShop: Shop | null;
  currentOrder: Record<string, DishOrder>;
  currentOrderTotalAmount: number;
}

// Initial state
const initialState: ShopState = {
  currentShop: null,
  currentOrder: {},
  currentOrderTotalAmount: 0,
};

// Create Slice
export const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    updateCurrentShop: (state, action: PayloadAction<Shop>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      state.currentShop = action.payload;
    },

    resetCurrentOrder: (state) => {
      state.currentOrder = {};
      state.currentOrderTotalAmount = 0;
    },

    updateCurrentOrder: (
      state,
      action: PayloadAction<{ dish: Dish; quantity?: number }>
    ) => {
      if (!_.get(action, "payload")) {
        return;
      }
      const previousState = state.currentOrder[action.payload.dish.id];
      let quantity = action.payload.quantity || 1;
      let previousQuantity = previousState?.quantity || 0;
      if (!action.payload.quantity && previousState) {
        quantity = previousState.quantity + 1;
      }
      state.currentOrder[action.payload.dish.id] = {
        dishId: action.payload.dish.id,
        quantity,
      };
      state.currentOrderTotalAmount +=
        action.payload.dish.price * (quantity - previousQuantity);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

// Action creators
export const { updateCurrentShop, resetCurrentOrder, updateCurrentOrder } =
  shopSlice.actions;

export default shopSlice.reducer;
