import { useLocalSearchParams, useRouter } from "expo-router";
import { AppBar } from "../../../../../../components/AppBar";
import { goBackShopMenu } from "../../../../../../apis/navigate.service";
import { Surface, Text } from "react-native-paper";

export default function OrderManagementHistoryPage() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const router = useRouter();

  return (
    <Surface style={{ flex: 1, padding: 16 }}>
      <Text>History</Text>
    </Surface>
  );
}
