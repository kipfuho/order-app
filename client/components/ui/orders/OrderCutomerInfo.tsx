import { Surface, Text } from "react-native-paper";
import { OrderSession } from "../../../stores/state.interface";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export default function OrderCustomerInfo({
  orderSession,
  children,
}: {
  orderSession: OrderSession;
  children?: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <Surface mode="flat" style={{ gap: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        {orderSession.customerInfo?.customerName ?? t("guest")}
      </Text>
      <Text style={{ fontSize: 15 }}>
        {t("bill_no")}: {orderSession.billNo}
      </Text>
      <Text style={{ fontSize: 15 }}>
        {t("customer_phone")}:{" "}
        {orderSession.customerInfo?.customerPhone ?? "N/A"}
      </Text>
      <Text style={{ fontSize: 15 }}>
        {t("customer_number")}:{" "}
        {orderSession.customerInfo?.numberOfCustomer ?? 1}
      </Text>
      <Text style={{ fontSize: 15 }}>
        {t("table_name")}: {orderSession.tableName}
      </Text>
      <Text style={{ fontSize: 15 }}>
        {t("check_in")}: {orderSession.createdAt}
      </Text>
      {children}
    </Surface>
  );
}
