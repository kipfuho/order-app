import _ from "lodash";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { Cart, CartItem, Customer, Dish, Shop, Table } from "./state.interface";

interface CustomerState {
  shop: Shop | null;
  table: Table | null;
  user: Customer | null;
  cartItemByDishId: Record<
    string,
    { id?: string; totalQuantity: number; newQuantity: number }
  >;
  currentCartItem: Record<string, CartItem>;
  currentCartAmount: number;
  isUpdateCartDebouncing: boolean;
  dishById: Record<string, Dish>;
}

// Initial state
const initialState: CustomerState = {
  shop: null,
  table: null,
  user: null,
  cartItemByDishId: {},
  currentCartItem: {},
  currentCartAmount: 0,
  isUpdateCartDebouncing: false,
  dishById: {},
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

      state.currentCartItem = _.keyBy(action.payload.cartItems, "id");
      state.currentCartAmount = action.payload.totalAmount || 0;

      const cartItemByDishId = _.groupBy(action.payload.cartItems, "dishId");
      const newCartItemByDishId: Record<
        string,
        { id?: string; totalQuantity: number; newQuantity: number }
      > = {};
      Object.values(cartItemByDishId).forEach((cartItemsOfSingleDish) => {
        const cartItemWithoutNote = _.find(
          cartItemsOfSingleDish,
          (_cartItem) => !_cartItem.note,
        );
        newCartItemByDishId[cartItemsOfSingleDish[0].dishId] = {
          id: cartItemWithoutNote?.id,
          totalQuantity: _.sumBy(cartItemsOfSingleDish, "quantity"),
          newQuantity: cartItemWithoutNote?.quantity || 0,
        };
      });
      state.cartItemByDishId = newCartItemByDishId;
    },

    updateCartSingleDish: (
      state,
      action: PayloadAction<{
        id?: string;
        dish: Dish;
        quantity: number;
        note?: string;
      }>,
    ) => {
      if (!_.get(action, "payload")) return;

      const dish = action.payload.dish;
      const currentCartItem =
        state.currentCartItem[action.payload.id || dish.id];
      state.currentCartAmount +=
        (action.payload.quantity - (currentCartItem?.quantity || 0)) *
        dish.price;

      if (action.payload.quantity === 0) {
        delete state.currentCartItem[action.payload.id || dish.id];
        delete state.cartItemByDishId[dish.id];
        return;
      }
      state.currentCartItem[action.payload.id || dish.id] = {
        ...currentCartItem,
        dishId: dish.id,
        quantity: action.payload.quantity,
        note: action.payload.note,
      };
      state.cartItemByDishId[dish.id] = {
        ...state.cartItemByDishId[dish.id],
        totalQuantity:
          (state.cartItemByDishId[dish.id]?.totalQuantity || 0) +
          action.payload.quantity -
          (state.cartItemByDishId[dish.id]?.newQuantity || 0),
        newQuantity: action.payload.quantity,
      };
    },

    updateCurrentCartAmount: (state, action: PayloadAction<number>) => {
      if (!_.get(action, "payload")) return;

      state.currentCartAmount = action.payload;
    },

    updateCustomer: (state, action: PayloadAction<Customer | null>) => {
      if (!_.get(action, "payload")) return;
      state.user = action.payload;
    },

    updateIsUpdateCartDebouncing: (state, action: PayloadAction<boolean>) => {
      state.isUpdateCartDebouncing = action.payload;
    },

    updateDishesForCustomer: (
      state,
      action: PayloadAction<{ dishes: Dish[] }>,
    ) => {
      state.dishById = _.keyBy(action.payload.dishes, "id");
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
  updateIsUpdateCartDebouncing,
  updateDishesForCustomer,
} = customerSlice.actions;

export default customerSlice.reducer;
