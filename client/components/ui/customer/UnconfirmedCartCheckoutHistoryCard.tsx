import { BLURHASH } from "@/constants/common";
import { convertPaymentAmount } from "@/constants/utils";
import { OrderCartCheckoutHistory } from "@/stores/state.interface";
import { RootState } from "@/stores/store";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { Divider, Surface, Text } from "react-native-paper";
import { useSelector } from "react-redux";

export default function UnconfirmedCartCheckoutHistoryCard({
  order,
}: {
  order: OrderCartCheckoutHistory;
}) {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const { dishById } = useSelector((state: RootState) => state.customer);
  const dishOrderWidth = Math.min(200, width * 0.3);

  return (
    <Surface style={{ padding: 8, borderRadius: 8 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            {order.tableName}
          </Text>
        </View>
        <Text>{order.createdAt}</Text>
      </View>
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
                        dish.imageUrls[0] ||
                        // eslint-disable-next-line @typescript-eslint/no-require-imports
                        require("@assets/images/savora.png")
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
              <Divider />
            </>
          );
        })}
      </View>
      <Text
        style={{ textAlign: "center", fontSize: 18, marginTop: 12 }}
      >{`${t("total_payment_amount")}: ${convertPaymentAmount(order.paymentAmount)}`}</Text>
    </Surface>
  );
}
