import { useEffect } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { useColorScheme } from "@/hooks/useColorScheme";
import Toast from "react-native-toast-message";
import store, { persistor } from "../stores/store";
import { StyleSheet } from "react-native";
import { Amplify } from "aws-amplify";
import { AmplifyConfig } from "../amplify_outputs";

Amplify.configure(AmplifyConfig);

// Prevent splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;

  useEffect(() => {
    // Hide splash screen once assets are loaded
    SplashScreen.hideAsync();
  }, []);

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={theme}>
          <Stack>
            <Stack.Screen name="(shop)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen
              name="(shop)/shop/[shopId]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <Toast />
        </PaperProvider>
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
