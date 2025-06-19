import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { User } from "./state.interface";

interface AuthState {
  session: User | null;
  clientId: string;
}

const initialState: AuthState = {
  session: null,
  clientId: uuidv4(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn: (
      state,
      action: PayloadAction<{
        user: User;
        clientId: string;
      }>,
    ) => {
      if (!action.payload) return;
      state.session = action.payload.user;
      state.clientId = action.payload.clientId;
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
