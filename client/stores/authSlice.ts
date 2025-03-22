import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./state.interface";
import { PURGE } from "redux-persist";

interface AuthState {
  session: User | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  session: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<User>) => {
      if (!action.payload) return;
      state.session = action.payload;
      state.isLoading = false;
    },
    signOut: (state) => {
      state.session = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

export const { signIn, signOut, setLoading } = authSlice.actions;
export default authSlice.reducer;
