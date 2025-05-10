import { useRouter } from "expo-router";
import { goBackShopHome } from "../../../../../../../apis/navigate.service";
import { AppBar } from "../../../../../../../components/AppBar";
import { Surface, Text } from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { Shop } from "../../../../../../../stores/state.interface";
import { useTranslation } from "react-i18next";

export default function OrderManagementApprovePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  return (
    <>
      <AppBar
        title={t("shop_approve_order")}
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
