import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import Toast from "react-native-toast-message";
import store, { persistor } from "../stores/store";
import _ from "lodash";
import { StyleSheet } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isRootReady, setIsRootReady] = useState(false);

  useEffect(() => {
    // Hide the splash screen and mark the root layout as ready
    SplashScreen.hideAsync().then(() => {
      setIsRootReady(true);
    });
  }, []);

  // Prevent rendering UserLayout until RootLayout is ready
  if (!isRootReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(shop)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(shop)/shop/[shopId]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <Toast />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  createButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonText: { color: "#fff", fontWeight: "bold" },
  loader: { flex: 1, justifyContent: "center" },
  shopItem: { padding: 15, borderBottomWidth: 1, borderColor: "#ddd" },
  shopName: { fontSize: 18, fontWeight: "bold" },
  shopDetails: { fontSize: 14, color: "gray" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "red",
    fontWeight: "bold",
  },
  button: {
    marginTop: 10,
  },

  backButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
    alignSelf: "center",
    width: 50,
  },
  backButtonText: { color: "#fff", fontWeight: "bold" },
  errorText: { color: "red", fontSize: 18, textAlign: "center" },
  item: {
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  itemText: {
    fontSize: 18,
    color: "#333",
  },
});
