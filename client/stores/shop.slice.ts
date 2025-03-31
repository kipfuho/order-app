import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { Shop } from "./state.interface";
import { PURGE } from "redux-persist";

interface ShopState {
  currentShop: Shop | null;
}

// Initial state
const initialState: ShopState = {
  currentShop: null,
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
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

// Action creators
export const { updateCurrentShop } = shopSlice.actions;

export default shopSlice.reducer;
