import { useRouter } from "expo-router";
import { AppBar } from "../../../../../../components/AppBar";
import { goBackShopHome } from "../../../../../../apis/navigate.service";
import { Surface, Text } from "react-native-paper";
import { Shop } from "../../../../../../stores/state.interface";
import { RootState } from "../../../../../../stores/store";
import { useSelector } from "react-redux";

export default function OrderManagementHistoryPage() {
  const router = useRouter();
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  return (
    <>
      <AppBar
        title="History"
        goBack={() => {
          goBackShopHome({ router, shopId: shop.id });
        }}
      />
      <Surface style={{ flex: 1, padding: 16 }}>
        <Text>History</Text>
      </Surface>
    </>
  );
}
