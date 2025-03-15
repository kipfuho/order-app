import { Text } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useSession } from "../../hooks/useSession";

export default function AppLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (session) {
    return <Redirect href="/" />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack />;
}
