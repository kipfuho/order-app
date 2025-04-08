import React from "react";
import { View } from "react-native";
import { Surface, Text, Chip } from "react-native-paper";
import { OrderSessionHistory } from "../../../stores/state.interface";
import { useTranslation } from "react-i18next";
import {
  convertPaymentAmount,
  getCountryCurrency,
} from "../../../constants/utils";
import OrderSessionStatusChip from "./OrderSessionStatusChip";

export default function OrderHistoryCard({
  orderHistory,
}: {
  orderHistory?: OrderSessionHistory;
}) {
  const { t } = useTranslation();

  if (!orderHistory) return;

  return (
    <Surface style={{ boxShadow: "none" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View>
          <Text style={{ fontSize: 14, color: "gray" }}>{t("check_in")}:</Text>
          <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 4 }}>
            {orderHistory.createdAt}
          </Text>
          <Text style={{ fontSize: 14, color: "gray" }}>{t("check_out")}:</Text>
          <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 4 }}>
            {orderHistory.endedAt}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {orderHistory.tableName}
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {convertPaymentAmount(orderHistory.paymentAmount)}
          </Text>
          <OrderSessionStatusChip status={orderHistory.status} />
        </View>
      </View>

      <Text
        style={{
          marginTop: 16,
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        #{orderHistory.billNo}
      </Text>
    </Surface>
  );
}
