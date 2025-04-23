import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dish, DishOrder, OrderSession, Shop, Table } from "./state.interface";
import { PURGE } from "redux-persist";

type CustomerInfo = {
  numberOfCustomer: number;
  customerName: string;
  customerPhone: string;
};

interface ShopState {
  currentShop: Shop | null;
  currentOrder: Record<string, Partial<DishOrder>>;
  currentOrderTotalAmount: number;
  currentCustomerInfo: CustomerInfo;
  currentTable: Table | null;
  currentOrderSession: OrderSession | null;
}

// Initial state
const initialState: ShopState = {
  currentShop: null,
  currentOrder: {},
  currentOrderTotalAmount: 0,
  currentCustomerInfo: {
    numberOfCustomer: 1,
    customerName: "",
    customerPhone: "",
  },
  currentTable: null,
  currentOrderSession: null,
};

// Create Slice
export const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    updateCurrentShop: (state, action: PayloadAction<Shop>) => {
      if (!action.payload) return;

      state.currentShop = action.payload;
    },

    resetCurrentOrder: (state) => {
      state.currentOrder = {};
      state.currentOrderTotalAmount = 0;
    },

    resetCurrentTable: (state) => {
      state.currentTable = null;
      state.currentOrderSession = null;
    },

    resetCurrentOrderSession: (state) => {
      state.currentOrderSession = null;
    },

    updateCurrentOrder: (
      state,
      action: PayloadAction<{ dish: Dish; quantity?: number }>
    ) => {
      if (!action.payload) return;

      const previousState = state.currentOrder[action.payload.dish.id];
      const isPayloadQuantityValid =
        action.payload.quantity !== undefined && action.payload.quantity >= 0;
      let quantity = action.payload.quantity;
      if (!isPayloadQuantityValid) {
        quantity = 1;
      }
      let previousQuantity = previousState?.quantity || 0;
      if (!isPayloadQuantityValid && previousState) {
        quantity = (previousState.quantity ?? 0) + 1;
      }
      quantity = quantity ?? 0;
      state.currentOrder[action.payload.dish.id] = {
        dishId: action.payload.dish.id,
        quantity,
      };
      state.currentOrderTotalAmount +=
        action.payload.dish.price * (quantity - previousQuantity);
    },

    updateCurrentCustomerInfo: (
      state,
      action: PayloadAction<Partial<CustomerInfo>>
    ) => {
      if (!action.payload) return;

      state.currentCustomerInfo = {
        ...state.currentCustomerInfo,
        ...action.payload,
      };
    },

    updateCurrentTable: (state, action: PayloadAction<Table>) => {
      if (!action.payload) return;

      state.currentTable = action.payload;
    },

    updateCurrentOrderSession: (state, action: PayloadAction<OrderSession>) => {
      if (!action.payload) return;

      state.currentOrderSession = action.payload;
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
  updateCurrentShop,
  resetCurrentOrder,
  resetCurrentTable,
  resetCurrentOrderSession,
  updateCurrentOrder,
  updateCurrentCustomerInfo,
  updateCurrentTable,
  updateCurrentOrderSession,
} = shopSlice.actions;

export default shopSlice.reducer;
