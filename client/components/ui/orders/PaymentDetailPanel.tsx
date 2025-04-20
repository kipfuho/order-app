import { useTranslation } from "react-i18next";
import { OrderSession } from "../../../stores/state.interface";
import { Divider, Surface, Text } from "react-native-paper";
import _ from "lodash";
import { ScrollView, View } from "react-native";
import { convertPaymentAmount } from "../../../constants/utils";

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
              {convertPaymentAmount(orderSessionDetail.paymentAmount)}
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
                <Text style={{ marginLeft: 4, fontSize: 16 }}>x</Text>
                <Text style={{ marginLeft: 8, fontSize: 16 }}>{dish.name}</Text>
              </Text>
              <Text style={{ fontSize: 16 }}>
                {convertPaymentAmount(dish.price)}
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
            <Text style={{ fontSize: 16 }}>{t("total")}</Text>
            <Text style={{ fontSize: 16 }}>
              {convertPaymentAmount(orderSessionDetail.pretaxPaymentAmount)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <Text style={{ fontSize: 16 }}>{t("discount")}</Text>
            <Text style={{ fontSize: 16 }}>
              {convertPaymentAmount(
                orderSessionDetail.totalDiscountAmountBeforeTax
              )}
            </Text>
          </View>

          {orderSessionDetail.taxDetails.map((taxDetail, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 6,
                marginLeft: 16,
              }}
            >
              <Text style={{ fontSize: 16 }}>{`${t("tax")}(${
                taxDetail.taxRate
              }%)`}</Text>
              <Text style={{ fontSize: 16 }}>
                {convertPaymentAmount(taxDetail.taxAmount)}
              </Text>
            </View>
          ))}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <Text style={{ fontSize: 16 }}>{t("tax")}</Text>
            <Text style={{ fontSize: 16 }}>
              {convertPaymentAmount(orderSessionDetail.totalTaxAmount)}
            </Text>
          </View>
        </Surface>
      </ScrollView>
    </Surface>
  );
}
