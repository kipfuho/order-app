import { Text } from "react-native";
import { Redirect, Stack } from "expo-router";
import store, { persistor } from "../../stores/store";
import { useEffect } from "react";
import { useSession } from "../../hooks/useSession";

export default function AppLayout() {
  const { session, isLoading } = useSession();

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Delete") {
        console.log("Wiping persisted store...");
        await persistor.purge();
        console.log(store.getState());
        return <Redirect href="/login" />;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack screenOptions={{ headerShown: false }} />;
}
