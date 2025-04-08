import { useEffect } from "react";
import { Provider as ReduxProvider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import store, { persistor, RootState } from "../stores/store";
import { StyleSheet } from "react-native";
import { Amplify } from "aws-amplify";
import { AmplifyConfig } from "../amplify_outputs";
import Toast from "react-native-toast-message";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../locales/i18n";

Amplify.configure(AmplifyConfig);

// Prevent splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function ThemeLayout() {
  const { darkMode, locale } = useSelector((state: RootState) => state.setting);
  const theme = darkMode ? MD3DarkTheme : MD3LightTheme;
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </PaperProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen once assets are loaded
    SplashScreen.hideAsync();
  }, []);

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <I18nextProvider i18n={i18n}>
          <ThemeLayout />
        </I18nextProvider>
      </PersistGate>
    </ReduxProvider>
  );
}

export const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    padding: 16,
  },
  baseButton: {
    width: 200,
    alignSelf: "center",
    marginTop: 10,
  },
  baseLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  baseGrid: {
    boxShadow: "none",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 10,
  },
});
