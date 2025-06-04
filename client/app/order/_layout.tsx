import { Redirect, Stack } from "expo-router";
import { persistor } from "@stores/store";
import { useEffect } from "react";
import { loginForAnonymousCustomerRequest } from "@apis/auth.api.service";
import { Platform } from "react-native";
import { useCustomerSession } from "@/hooks/useCustomerSession";

export default function CustomerAppLayout() {
  const { session } = useCustomerSession();

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Delete") {
        await persistor.purge();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!session) {
    loginForAnonymousCustomerRequest();
    return <Redirect href="/order/home" />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack screenOptions={{ headerShown: false }} />;
}
