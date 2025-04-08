import { createSlice } from "@reduxjs/toolkit";

type SettingsState = {
  darkMode: boolean;
  locale: string;
};

const initialState: SettingsState = {
  darkMode: false,
  locale: "",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
    },
    setLocale: (state, action) => {
      state.locale = action.payload;
    },
  },
});

export const { toggleDarkMode, setDarkMode, setLocale } = settingsSlice.actions;
export default settingsSlice.reducer;
