import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { LoaderBasic } from "@components/ui/Loader";
import { useGetOrderSessionDetailQuery } from "@stores/apiSlices/orderApi.slice";
import { Shop } from "@stores/state.interface";
import { Button, Surface, Text, useTheme } from "react-native-paper";
import { styles } from "@/constants/styles";
import { useTranslation } from "react-i18next";
import { goToTablesForOrderList } from "@/apis/navigate.service";

export default function OrderSessionDetailLayout() {
  const { orderSessionId } = useLocalSearchParams() as {
    orderSessionId: string;
  };
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;
  const { data: orderSessionDetail, isLoading: orderSessionDetailLoading } =
    useGetOrderSessionDetailQuery({ orderSessionId, shopId: shop.id });

  if (orderSessionDetailLoading) {
    return <LoaderBasic />;
  }

  if (!orderSessionDetail) {
    return (
      <Surface style={styles.baseContainer}>
        <Text
          variant="displayMedium"
          style={{ color: theme.colors.error, alignSelf: "center" }}
        >
          {t("ordersession_not_found")}
        </Text>
        <Button
          mode="contained"
          style={styles.baseButton}
          onPress={() => goToTablesForOrderList({ router, shopId: shop.id })}
        >
          {t("go_back")}
        </Button>
      </Surface>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
