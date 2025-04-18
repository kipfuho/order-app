import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Surface, Text, useTheme } from "react-native-paper";
import { RootState } from "../../../../../../../../../../../stores/store";
import { LoaderBasic } from "../../../../../../../../../../../components/ui/Loader";
import { useGetActiveOrderSessionsQuery } from "../../../../../../../../../../../stores/apiSlices/orderApi.slice";
import { updateCurrentOrderSession } from "../../../../../../../../../../../stores/shop.slice";
import { connectAppSyncForOrderSession } from "../../../../../../../../../../../apis/aws.service";
import { styles } from "../../../../../../../../../../_layout";
import { goToTablesForOrderList } from "../../../../../../../../../../../apis/navigate.service";
import {
  Shop,
  Table,
} from "../../../../../../../../../../../stores/state.interface";
import { useTranslation } from "react-i18next";

export default function PaymentOrderSessionLayout() {
  const { shopId, orderSessionId } = useLocalSearchParams() as {
    shopId: string;
    orderSessionId: string;
  };
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { t } = useTranslation();

  const { currentShop, currentTable, currentOrderSession } = useSelector(
    (state: RootState) => state.shop
  );
  const shop = currentShop as Shop;
  const table = currentTable as Table;

  const {
    data: activeOrderSessions = [],
    isLoading: activeOrderSessionLoading,
    isFetching: activeOrderSessionFetching,
  } = useGetActiveOrderSessionsQuery({
    shopId: shop.id,
    tableId: table.id,
  });

  const activeOrderSession = activeOrderSessions.find(
    (orderSession) => orderSession.id === orderSessionId
  );

  useEffect(() => {
    if (!activeOrderSession) return;

    dispatch(updateCurrentOrderSession(activeOrderSession));
    connectAppSyncForOrderSession({ orderSessionId });
  }, [orderSessionId, activeOrderSessionFetching]);

  if (activeOrderSessionLoading) {
    return <LoaderBasic />;
  }

  if (!activeOrderSession) {
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
          onPress={() => goToTablesForOrderList({ router, shopId })}
        >
          {t("go_back")}
        </Button>
      </Surface>
    );
  }

  if (!currentOrderSession) {
    return <LoaderBasic />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
