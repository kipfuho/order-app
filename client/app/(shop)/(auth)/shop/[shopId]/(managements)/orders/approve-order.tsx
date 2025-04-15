import { useRouter } from "expo-router";
import { goBackShopHome } from "../../../../../../../apis/navigate.service";
import { AppBar } from "../../../../../../../components/AppBar";
import { Surface, Text } from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { Shop } from "../../../../../../../stores/state.interface";

export default function OrderManagementApprovePage() {
  const router = useRouter();
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  return (
    <>
      <AppBar
        title="Approve Order"
        goBack={() => {
          goBackShopHome({ router, shopId: shop.id });
        }}
      />
      <Surface style={{ flex: 1, padding: 16 }}>
        <Text>Approve orders</Text>
      </Surface>
    </>
  );
}
