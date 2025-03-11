  import { Provider } from "react-redux";
  import { PersistGate } from "redux-persist/integration/react";
  import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
  import { Stack } from "expo-router";
  import * as SplashScreen from "expo-splash-screen";
  import { useEffect } from "react";
  import "react-native-reanimated";
  import { useColorScheme } from "@/hooks/useColorScheme";
  import Toast from "react-native-toast-message";

  import store, { persistor } from "../stores/store";

  // Prevent the splash screen from auto-hiding before asset loading is complete.
  SplashScreen.preventAutoHideAsync();

  export default function RootLayout() {
    const colorScheme = useColorScheme();

    useEffect(() => {
      SplashScreen.hideAsync();
    }, []);

    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <Toast />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    );
  }
