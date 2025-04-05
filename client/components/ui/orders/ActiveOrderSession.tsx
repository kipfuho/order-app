import { Button, Surface, Text } from "react-native-paper";
import { OrderSession } from "../../../stores/state.interface";
import { View } from "react-native";

export function ActiveOrderSession({
  activeOrderSession,
}: {
  activeOrderSession: OrderSession;
}) {
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
        <Button mode="contained" style={{ flex: 1 }}>
          Thanh toán
        </Button>
        <Button mode="contained-tonal" style={{ flex: 1 }}>
          Thêm sản phẩm
        </Button>
      </View>
    </Surface>
  );
}
