import { useLocalSearchParams, useRouter } from "expo-router";
import { AppBar } from "../../../../../../../../../../components/AppBar";
import { LoaderBasic } from "../../../../../../../../../../components/ui/Loader";
import { useGetOrderSessionDetailQuery } from "../../../../../../../../../../stores/apiSlices/orderApi.slice";
import { goToTablesForOrderList } from "../../../../../../../../../../apis/navigate.service";
import {
  Divider,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { OrderSession } from "../../../../../../../../../../stores/state.interface";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../../../stores/store";
import { ScrollView, View } from "react-native";

function CustomerInfo({ orderSession }: { orderSession: OrderSession }) {
  return (
    <Surface style={{ gap: 8, boxShadow: "none" }}>
      <ScrollView>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          {orderSession.customerInfo?.customerName ?? "Khách lẻ"}
        </Text>
        <Text style={{ fontSize: 15 }}>Mã hoá đơn: {orderSession.id}</Text>
        <Text style={{ fontSize: 15 }}>
          Số điện thoại: {orderSession.customerInfo?.customerPhone ?? "N/A"}
        </Text>
        <Text style={{ fontSize: 15 }}>
          Số người: {orderSession.customerInfo?.numberOfCustomer ?? 1}
        </Text>
        <Text style={{ fontSize: 15 }}>Tên bàn: {orderSession.tableName}</Text>
        <Text style={{ fontSize: 15 }}>Giờ vào: {orderSession.createdAt}</Text>
      </ScrollView>
    </Surface>
  );
}

function ActiveOrderSessionPage({
  activeOrderSession,
}: {
  activeOrderSession: OrderSession | null;
}) {
  const theme = useTheme();

  if (!activeOrderSession) {
    return;
  }

  return (
    <Surface style={{ flex: 1, padding: 12, borderRadius: 10 }}>
      <ScrollView>
        <CustomerInfo orderSession={activeOrderSession} />
        <Divider />
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 10,
            flexWrap: "wrap",
          }}
        >
          <TouchableRipple
            onPress={() => {}}
            style={{
              flex: 1,
              borderRadius: 4,
              backgroundColor: theme.colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{ textAlign: "center", color: theme.colors.onPrimary }}
              numberOfLines={2}
            >
              Thêm sản phẩm
            </Text>
          </TouchableRipple>
          <TouchableRipple
            onPress={() => {}}
            style={{
              flex: 1,
              borderRadius: 4,
              backgroundColor: theme.colors.errorContainer,
              paddingVertical: 12,
              paddingHorizontal: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: theme.colors.onErrorContainer,
              }}
              numberOfLines={2}
            >
              Huỷ
            </Text>
          </TouchableRipple>
        </View>
      </ScrollView>
    </Surface>
  );
}

function OrderSessionDetailPage({
  orderSessionDetail,
}: {
  orderSessionDetail: OrderSession | undefined;
}) {
  if (!orderSessionDetail) {
    return;
  }

  return (
    <Surface style={{ flex: 1, padding: 12, borderRadius: 10 }}>
      <CustomerInfo orderSession={orderSessionDetail} />
      <Divider />
    </Surface>
  );
}

function PaymentMethodPage() {
  return (
    <Surface style={{ flex: 1, padding: 12, borderRadius: 10 }}>
      <ScrollView>PaymentMethodPage</ScrollView>
    </Surface>
  );
}

export default function PaymentOrderSession() {
  const { shopId, orderSessionId } = useLocalSearchParams() as {
    shopId: string;
    orderSessionId: string;
  };
  const router = useRouter();
  const theme = useTheme();

  const { currentOrderSession } = useSelector((state: RootState) => state.shop);

  const { data: orderSessionDetail, isLoading: orderSessionDetailLoading } =
    useGetOrderSessionDetailQuery({ orderSessionId, shopId });

  if (orderSessionDetailLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title="Payment Order Session"
        goBack={() => {
          goToTablesForOrderList({ router, shopId });
        }}
      />
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
    </>
  );
}
