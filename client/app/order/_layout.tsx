import { Redirect, Stack } from "expo-router";
import store, { persistor } from "../../stores/store";
import { useEffect } from "react";
import { useSession } from "../../hooks/useSession";
import { LoaderBasic } from "../../components/ui/Loader";
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
        console.log(store.getState());
        return <Redirect href="/login" />;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    dispatch(setCustomerApp(true));
    if (!customerSession) {
      loginForAnonymousCustomerRequest();
    }
  }, [customerSession]);

  if (!customerSession) {
    return <LoaderBasic />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack screenOptions={{ headerShown: false }} />;
}
