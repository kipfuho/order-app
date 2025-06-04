import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { User } from "./state.interface";

interface AuthState {
  session: User | null;
}

const initialState: AuthState = {
  session: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<User>) => {
      if (!action.payload) return;
      state.session = action.payload;
    },
    signOut: (state) => {
      state.session = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

export const { signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
