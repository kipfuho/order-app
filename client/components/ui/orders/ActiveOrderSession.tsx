import { Button, Surface, Text } from "react-native-paper";
import { OrderSession } from "../../../stores/state.interface";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentOrderSession } from "../../../stores/shop.slice";
import { useRouter } from "expo-router";
import { goToOrderSessionPayment } from "../../../apis/navigate.service";
import { RootState } from "../../../stores/store";

export function ActiveOrderSession({
  activeOrderSession,
  handleAddProduct,
}: {
  activeOrderSession: OrderSession;
  handleAddProduct: () => void;
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { currentShop, currentTable } = useSelector(
    (state: RootState) => state.shop
  );

  const onPaymentClick = () => {
    dispatch(updateCurrentOrderSession(activeOrderSession));
    goToOrderSessionPayment({
      router,
      orderSessionId: activeOrderSession.id,
      shopId: currentShop!.id,
      tableId: currentTable!.id,
    });
  };

  const onAddProductClick = () => {
    dispatch(updateCurrentOrderSession(activeOrderSession));
    handleAddProduct();
  };

  return (
    <Surface style={{ gap: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        {activeOrderSession.customerInfo?.customerName ?? "Khách lẻ"}
      </Text>
      <Text style={{ fontSize: 15 }}>Mã hoá đơn: {activeOrderSession.id}</Text>
      <Text style={{ fontSize: 15 }}>
        Số điện thoại: {activeOrderSession.customerInfo?.customerPhone ?? "N/A"}
      </Text>
      <Text style={{ fontSize: 15 }}>
        Số người: {activeOrderSession.customerInfo?.numberOfCustomer ?? 1}
      </Text>
      <Text style={{ fontSize: 15 }}>
        Tên bàn: {activeOrderSession.tableName}
      </Text>
      <Text style={{ fontSize: 15 }}>
        Giờ vào: {activeOrderSession.createdAt}
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <Button mode="contained" style={{ flex: 1 }} onPress={onPaymentClick}>
          Thanh toán
        </Button>
        <Button
          mode="contained-tonal"
          style={{ flex: 1 }}
          onPress={onAddProductClick}
        >
          Thêm sản phẩm
        </Button>
      </View>
    </Surface>
  );
}
