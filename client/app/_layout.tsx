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
  container: { flex: 1, padding: 20 },
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
  createButtonText: { fontWeight: "bold" },
  loader: { flex: 1, justifyContent: "center" },
  shopItem: { padding: 15, borderBottomWidth: 1, borderColor: "#ddd" },
  shopName: { fontSize: 18, fontWeight: "bold", color: "#fff" },
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
  backButtonText: { fontWeight: "bold" },
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
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dishItem: {
    fontSize: 16,
    paddingLeft: 10,
  },
  content: {
    flexDirection: "row", // Sidebar on left, content on right
    flex: 1,
  },
  sidebar: {
    width: 100,
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    borderRadius: 10,
  },
  categoryButton: {
    padding: 10,
    alignItems: "center",
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dishList: {
    flex: 1,
    paddingLeft: 10,
  },
});
