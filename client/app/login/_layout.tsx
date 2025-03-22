import { Redirect, Stack } from "expo-router";
import { useSession } from "../../hooks/useSession";
import { ActivityIndicator } from "react-native-paper";

export default function AppLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (session) {
    return <Redirect href="/" />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack />;
}
