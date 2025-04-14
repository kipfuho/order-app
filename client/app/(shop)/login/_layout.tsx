import { Redirect, Stack } from "expo-router";
import { useSession } from "../../../hooks/useSession";
import { LoaderBasic } from "../../../components/ui/Loader";

export default function AppLayout() {
  const { session } = useSession();

  if (session) {
    return <Redirect href="/" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
