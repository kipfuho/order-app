import { Button, Surface, Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

export default function OrderManagementOrderPage() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const router = useRouter();

  return (
    <Surface style={{ flex: 1, padding: 16 }}>
      <Text>Order</Text>
    </Surface>
  );
}
