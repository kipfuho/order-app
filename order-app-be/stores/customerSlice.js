import { createSlice } from "@reduxjs/toolkit";

export const customerSlice = createSlice({
  name: "restaurant",
  initialState: {
    value: {},
  },
  reducers: {
    update: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value = { ...state.value, ...action.payload };
    },
  },
});

// Action creators are generated for each case reducer function
export const { update } = customerSlice.actions;

export default counterSlice.reducer;
