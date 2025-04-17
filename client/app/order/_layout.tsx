import { Redirect, Stack } from "expo-router";
import { persistor } from "../../stores/store";
import { useEffect } from "react";
import { useSession } from "../../hooks/useSession";
import { loginForAnonymousCustomerRequest } from "../../apis/auth.api.service";
import { useDispatch } from "react-redux";
import { setCustomerApp } from "../../stores/authSlice";

export default function CustomerAppLayout() {
  const { customerSession } = useSession();
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
    dispatch(setCustomerApp(true));
  }, []);

  console.log(customerSession);
  if (!customerSession) {
    loginForAnonymousCustomerRequest();
    return <Redirect href="/order/home" />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack screenOptions={{ headerShown: false }} />;
}
