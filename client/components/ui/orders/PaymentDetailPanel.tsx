import { useTranslation } from "react-i18next";
import { OrderSession } from "../../../stores/state.interface";
import { Divider, Surface, Text } from "react-native-paper";
import _ from "lodash";
import { ScrollView, View } from "react-native";

export default function OrderSessionDetailPage({
  orderSessionDetail,
}: {
  orderSessionDetail: OrderSession | undefined;
}) {
  const { t } = useTranslation();

  if (!orderSessionDetail) {
    return;
  }

  const dishOrders = _.get(orderSessionDetail, "orders.0.dishOrders", []);

  return (
    <Surface
      mode="flat"
      style={{
        flex: 1,
        padding: 16,
        borderRadius: 10,
      }}
    >
      <ScrollView>
        <Surface mode="flat" style={{ flex: 1, boxShadow: "none" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginVertical: 4,
              flexWrap: "wrap",
            }}
          >
            <Text
              variant="titleMedium"
              style={{ marginBottom: 12, fontSize: 18 }}
              numberOfLines={3}
            >
              {t("total_payment_amount")}
            </Text>
            <Text style={{ fontSize: 18 }}>
              {orderSessionDetail.paymentAmount.toLocaleString()}
            </Text>
          </View>

          {dishOrders.map((dish, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 4,
              }}
            >
              <Text style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 16 }}>{dish.quantity}</Text>
                <Text> x </Text>
                <Text style={{ fontSize: 16 }}>{dish.name}</Text>
              </Text>
              <Text style={{ fontSize: 16 }}>
                {dish.price.toLocaleString()}
              </Text>
            </View>
          ))}

          <Divider style={{ marginVertical: 10 }} />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <Text>{t("total")}</Text>
            <Text>
              {(orderSessionDetail.pretaxPaymentAmount || 0).toLocaleString()}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <Text>{t("discount")}</Text>
            <Text>- 1000</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <Text>{t("tax")}</Text>
            <Text>10000</Text>
          </View>
        </Surface>
      </ScrollView>
    </Surface>
  );
}
