import { Redirect, Stack } from "expo-router";
import { persistor } from "../../../stores/store";
import { useEffect } from "react";
import { useSession } from "../../../hooks/useSession";
import { useDispatch } from "react-redux";
import { setCustomerApp } from "../../../stores/authSlice";

export default function AppLayout() {
  const { session } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Delete") {
        console.log("Wiping persisted store...");
        await persistor.purge();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    dispatch(setCustomerApp(false));
  }, []);

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
