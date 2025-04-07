import { useLocalSearchParams, useRouter } from "expo-router";
import { AppBar } from "../../../../../../../../../../components/AppBar";
import { LoaderBasic } from "../../../../../../../../../../components/ui/Loader";
import { useGetOrderSessionDetailQuery } from "../../../../../../../../../../stores/apiSlices/orderApi.slice";
import { goToTablesForOrderList } from "../../../../../../../../../../apis/navigate.service";
import { Surface, useTheme } from "react-native-paper";
import { OrderSession } from "../../../../../../../../../../stores/state.interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../../../../../../stores/store";
import { ScrollView, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Collapsible } from "../../../../../../../../../../components/Collapsible";
import { resetCurrentTable } from "../../../../../../../../../../stores/shop.slice";
import ActiveOrderSessionPage from "../../../../../../../../../../components/ui/orders/OrderDetailPanel";
import OrderSessionDetailPage from "../../../../../../../../../../components/ui/orders/PaymentDetailPanel";
import PaymentMethodPage from "../../../../../../../../../../components/ui/orders/PaymentPanel";

function Main({
  currentOrderSession,
  orderSessionDetail,
}: {
  currentOrderSession: OrderSession | null;
  orderSessionDetail: OrderSession | undefined;
}) {
  const { width } = useWindowDimensions();
  const theme = useTheme();

  if (width > 900) {
    return (
      <Surface
        style={{
          flex: 1,
          padding: 12,
          flexDirection: "row",
          gap: 12,
          backgroundColor: theme.colors.background,
        }}
      >
        <ActiveOrderSessionPage activeOrderSession={currentOrderSession} />
        <OrderSessionDetailPage orderSessionDetail={orderSessionDetail} />
        <PaymentMethodPage />
      </Surface>
    );
  }

  return (
    <ScrollView>
      <Surface
        style={{
          flex: 1,
          padding: 12,
          backgroundColor: theme.colors.background,
          gap: 12,
        }}
      >
        <Collapsible title="Order detail">
          <ActiveOrderSessionPage activeOrderSession={currentOrderSession} />
        </Collapsible>
        <Collapsible title="Payment detail">
          <OrderSessionDetailPage orderSessionDetail={orderSessionDetail} />
        </Collapsible>
        <Collapsible title="Payment">
          <PaymentMethodPage />
        </Collapsible>
      </Surface>
    </ScrollView>
  );
}

export default function PaymentOrderSession() {
  const { shopId, orderSessionId } = useLocalSearchParams() as {
    shopId: string;
    orderSessionId: string;
  };
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { currentOrderSession } = useSelector((state: RootState) => state.shop);

  const { data: orderSessionDetail, isLoading: orderSessionDetailLoading } =
    useGetOrderSessionDetailQuery({ orderSessionId, shopId });

  if (orderSessionDetailLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("payment")}
        goBack={() => {
          goToTablesForOrderList({ router, shopId });
          dispatch(resetCurrentTable());
        }}
      />
      <Main
        currentOrderSession={currentOrderSession}
        orderSessionDetail={orderSessionDetail}
      />
    </>
  );
}
