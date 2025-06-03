import _ from "lodash";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { Dish, DishOrder, OrderSession, Shop, Table } from "./state.interface";

type CustomerInfo = {
  numberOfCustomer: number;
  customerName: string;
  customerPhone: string;
};

interface ShopState {
  userPermission: Set<string>;
  currentShop: Shop | null;
  currentOrder: Record<string, Partial<DishOrder>>;
  currentOrderTotalAmount: number;
  currentCustomerInfo: CustomerInfo;
  currentTable: Table | null;
  currentOrderSession: OrderSession | null;
  dishesByCategory: Record<string, Dish[]>;
  kitchenDishOrder: Record<string, { confirmed: boolean }>;
}

// Initial state
const initialState: ShopState = {
  userPermission: new Set(),
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
  dishesByCategory: {},
  kitchenDishOrder: {},
};

// Create Slice
export const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    updatePermissions: (
      state,
      action: PayloadAction<{ permissions: string[] }>,
    ) => {
      if (!action.payload) return;

      state.userPermission = new Set(action.payload.permissions);
    },

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
      action: PayloadAction<{ dish: Dish; quantity?: number }>,
    ) => {
      if (!action.payload) return;

      const previousState = state.currentOrder[action.payload.dish.id];
      const isPayloadQuantityValid =
        action.payload.quantity !== undefined && action.payload.quantity >= 0;
      let quantity = action.payload.quantity;
      if (!isPayloadQuantityValid) {
        quantity = 1;
      }
      const previousQuantity = previousState?.quantity || 0;
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
      action: PayloadAction<Partial<CustomerInfo>>,
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

    updateDishesByCategory: (
      state,
      action: PayloadAction<{ dishes: Dish[] }>,
    ) => {
      if (!action.payload) return;

      state.dishesByCategory = _.groupBy(action.payload.dishes, "category.id");
    },

    updateKitchenDishOrder: (
      state,
      action: PayloadAction<{ dishOrderId: string; confirmed: boolean }>,
    ) => {
      if (!action.payload) return;

      const dishOrderId = action.payload.dishOrderId;
      state.kitchenDishOrder[dishOrderId] = {
        ...state.kitchenDishOrder[dishOrderId],
        confirmed: action.payload.confirmed,
      };
    },

    deleteKitchenDishOrder: (
      state,
      action: PayloadAction<{ dishOrderId: string }>,
    ) => {
      if (!action.payload) return;

      const dishOrderId = action.payload.dishOrderId;
      delete state.kitchenDishOrder[dishOrderId];
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
  updatePermissions,
  updateCurrentShop,
  resetCurrentOrder,
  resetCurrentTable,
  resetCurrentOrderSession,
  updateCurrentOrder,
  updateCurrentCustomerInfo,
  updateCurrentTable,
  updateCurrentOrderSession,
  updateDishesByCategory,
  updateKitchenDishOrder,
  deleteKitchenDishOrder,
} = shopSlice.actions;

export default shopSlice.reducer;
