import { BLURHASH, OrderSessionStatus } from "@/constants/common";
import { convertPaymentAmount } from "@/constants/utils";
import { OrderSessionCartCheckoutHistory } from "@/stores/state.interface";
import { RootState } from "@/stores/store";
import { Image } from "expo-image";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View, Linking } from "react-native";
import {
  ActivityIndicator,
  Button,
  Divider,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useSelector } from "react-redux";
import OrderSessionStatusChip from "../orders/OrderSessionStatusChip";
import { getVnPayUrl } from "@/apis/order.api.service";
import { useCustomerSession } from "@/hooks/useCustomerSession";

const CartHistoryOrderCard = ({
  order,
}: {
  order: {
    id: string;
    customerId: string;
    dishOrders: {
      dishId: string;
      name: string;
      quantity: number;
      price: number;
      note: string;
    }[];
  };
}) => {
  const { dishById } = useSelector((state: RootState) => state.customer);
  const { width } = useWindowDimensions();
  const dishOrderWidth = Math.min(200, width * 0.3);

  return (
    <View style={{ gap: 12 }}>
      {order.dishOrders.map((dishOrder, index) => {
        const dish = dishById[dishOrder.dishId || ""];
        return (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ width: dishOrderWidth, gap: 6 }}>
                {dish && (
                  <Image
                    source={
                      // eslint-disable-next-line @typescript-eslint/no-require-imports
                      dish.imageUrls[0] || require("@assets/images/savora.png")
                    }
                    placeholder={{ blurhash: BLURHASH }}
                    style={{
                      width: dishOrderWidth,
                      height: dishOrderWidth,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                  />
                )}
                <Text
                  numberOfLines={3}
                  style={{ fontSize: 16, textAlign: "center" }}
                >
                  {dishOrder.name}
                </Text>
              </View>
              <View style={{ flex: 4 }} />
              <View
                style={{
                  flex: 3,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  numberOfLines={2}
                  style={{ fontSize: 18, fontWeight: "bold" }}
                >
                  {convertPaymentAmount(dishOrder.price)}
                </Text>
                <Text
                  numberOfLines={2}
                  style={{ fontSize: 18, fontWeight: "bold" }}
                >
                  x{dishOrder.quantity}
                </Text>
              </View>
            </View>
            {index !== order.dishOrders.length - 1 && <Divider />}
          </>
        );
      })}
    </View>
  );
};

const MemoizedCartHistoryOrderCard = memo(CartHistoryOrderCard);

const CartCheckoutHistoryCard = ({
  orderSession,
}: {
  orderSession: OrderSessionCartCheckoutHistory;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { shop } = useSelector((state: RootState) => state.customer);
  const { session } = useCustomerSession();

  const [isLoading, setIsLoading] = useState(false);
  const handlePayUsingVNPay = async () => {
    if (!shop || !orderSession || !session) return;

    setIsLoading(true);
    const url = await getVnPayUrl({
      shopId: shop.id,
      orderSessionId: orderSession.id,
    });
    await Linking.openURL(url);
    setIsLoading(false);
  };

  return (
    <Surface style={{ padding: 8, borderRadius: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            {orderSession.tableName}
          </Text>
          <Text style={{ fontSize: 16, color: theme.colors.outline }}>
            #{orderSession.billNo}
          </Text>
        </View>
        <Text>{orderSession.createdAt}</Text>
      </View>
      <View style={{ gap: 8, marginTop: 16 }}>
        {orderSession.orders.map((order, index) => (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "bold" }}
              >{`${t("times")}: ${index + 1}`}</Text>
              {/* {order.customerId && (
                <Button mode="contained-tonal" style={{ borderRadius: 8 }}>
                  {t("order_again")}
                </Button>
              )} */}
            </View>
            <MemoizedCartHistoryOrderCard order={order} />
            <Divider />
          </>
        ))}
      </View>
      <Text
        style={{ textAlign: "center", fontSize: 18, marginTop: 12 }}
      >{`${t("total_payment_amount")}: ${convertPaymentAmount(orderSession.paymentAmount)}`}</Text>
      <OrderSessionStatusChip status={orderSession.status} />
      {orderSession.status === OrderSessionStatus.unpaid && (
        <Button
          mode="contained"
          onPress={handlePayUsingVNPay}
          style={{ marginTop: 12, borderRadius: 8 }}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator size={15} /> : t("pay_using_vnpay")}
        </Button>
      )}
    </Surface>
  );
};

export default memo(CartCheckoutHistoryCard);
