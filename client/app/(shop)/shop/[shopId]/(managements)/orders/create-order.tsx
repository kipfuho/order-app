import { useLocalSearchParams, useRouter } from "expo-router";
import { goBackShopMenu } from "../../../../../../apis/navigate.service";
import { AppBar } from "../../../../../../components/AppBar";
import { Surface, Text } from "react-native-paper";
import { useEffect } from "react";

export default function OrderManagementCreateOrderPage() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const router = useRouter();

  useEffect(() => {
    const fetchTablesForOrder = async () => {};
  });

  return (
    <Surface style={{ flex: 1, padding: 16 }}>
      <Text>Create orders</Text>
    </Surface>
  );
}
