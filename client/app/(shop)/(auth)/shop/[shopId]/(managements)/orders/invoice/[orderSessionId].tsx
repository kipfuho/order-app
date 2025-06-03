import { goToOrderHistory } from "@/apis/navigate.service";
import { AppBar } from "@/components/AppBar";
import { OrderSessionStatus } from "@/constants/common";
import { styles } from "@/constants/styles";
import { convertPaymentAmount } from "@/constants/utils";
import {
  useCancelOrderSessionPaidStatusMutation,
  useGetOrderSessionDetailQuery,
} from "@/stores/apiSlices/orderApi.slice";
import { Shop } from "@/stores/state.interface";
import { RootState } from "@/stores/store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView } from "react-native";
import {
  Text,
  Button,
  DataTable,
  Card,
  Surface,
  Divider,
} from "react-native-paper";
import { useSelector } from "react-redux";

const InvoiceDetailPage = () => {
  const { orderSessionId, shopId } = useLocalSearchParams() as {
    orderSessionId: string;
    shopId: string;
  };
  const router = useRouter();
  const { t } = useTranslation();
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;
  const { data: orderSessionDetail } = useGetOrderSessionDetailQuery({
    orderSessionId,
    shopId,
  });
  const [
    cancelOrderSessionPaidStatus,
    { isLoading: cancelOrderSessionPaidStatusLoading },
  ] = useCancelOrderSessionPaidStatusMutation();

  return (
    <>
      <AppBar
        title={t("invoice")}
        goBack={() => goToOrderHistory({ router, shopId })}
      />
      <Surface style={{ flex: 1, padding: 16 }}>
        <ScrollView>
          <View>
            {orderSessionDetail?.status === OrderSessionStatus.paid && (
              <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
                <Button mode="contained">{t("cancel_paid_status")}</Button>
              </View>
            )}
            <View>
              <Text
                variant="titleLarge"
                style={{
                  fontWeight: "bold",
                  alignSelf: "center",
                }}
              >
                {shop.name}
              </Text>
              <Text
                style={{
                  alignSelf: "center",
                }}
              >
                {shop.email}
              </Text>
              <Divider style={{ marginVertical: 4 }} />
              <Text
                style={{
                  alignSelf: "center",
                }}
              >{`${t("bill_no")}: ${orderSessionDetail?.billNo}`}</Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 16,
                }}
              >
                <Text>{orderSessionDetail?.customerName ?? t("guest")}</Text>
                <Text>{`${t("customer_number")}: ${orderSessionDetail?.numberOfCustomer}`}</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>{orderSessionDetail?.customerPhone}</Text>
                <Text>{orderSessionDetail?.tableName}</Text>
              </View>
              {orderSessionDetail?.startedByUserName && (
                <Text>{`${t("serving")}: ${orderSessionDetail.startedByUserName}`}</Text>
              )}
              {orderSessionDetail?.paidByUserName && (
                <Text>{`${t("cashier")}: ${orderSessionDetail.paidByUserName}`}</Text>
              )}
              <Text>{`${t("check_in")}: ${orderSessionDetail?.createdAt}`}</Text>
            </View>

            <Divider style={{ marginVertical: 4 }} />

            <DataTable style={{ marginTop: 4 }}>
              <DataTable.Header style={{ padding: 0 }}>
                <DataTable.Title style={{ flex: 4, padding: 1 }}>
                  <Text>{t("print_product_name")}</Text>
                </DataTable.Title>
                <DataTable.Title numeric style={{ flex: 1, padding: 1 }}>
                  <Text>{t("print_product_quantity")}</Text>
                </DataTable.Title>
                <DataTable.Title numeric style={{ flex: 2, padding: 1 }}>
                  <Text>{t("print_product_price")}</Text>
                </DataTable.Title>
                <DataTable.Title numeric style={{ flex: 2, padding: 1 }}>
                  <Text>{t("print_product_total_price")}</Text>
                </DataTable.Title>
              </DataTable.Header>

              {(orderSessionDetail?.orders?.[0]?.dishOrders || []).map(
                (dishOrder, index) => (
                  <DataTable.Row key={index} style={{ padding: 0 }}>
                    <DataTable.Cell style={{ flex: 4, padding: 1 }}>
                      <Text>{dishOrder.name}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={{ flex: 1, padding: 1 }}>
                      <Text numberOfLines={3}>{dishOrder.quantity}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={{ flex: 2, padding: 1 }}>
                      {convertPaymentAmount(dishOrder.price)}
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={{ flex: 2, padding: 1 }}>
                      {convertPaymentAmount(dishOrder.beforeTaxTotalPrice)}
                    </DataTable.Cell>
                  </DataTable.Row>
                ),
              )}
            </DataTable>

            <View style={{ marginTop: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 16 }}>{t("total")}</Text>
                <Text style={{ fontSize: 16 }}>
                  {convertPaymentAmount(
                    orderSessionDetail?.pretaxPaymentAmount,
                  )}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <Text style={{ fontSize: 14 }}>{t("discount")}</Text>
                <Text style={{ fontSize: 14 }}>
                  {`- ${convertPaymentAmount(
                    orderSessionDetail?.afterTaxTotalDiscountAmount,
                  )}`}
                </Text>
              </View>

              {orderSessionDetail?.taxDetails.map((taxDetail) => {
                if (taxDetail.taxAmount <= 0) return null;
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 8,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14 }}
                    >{`${t("tax")} (${taxDetail.taxRate}%)`}</Text>
                    <Text style={{ fontSize: 14 }}>
                      {convertPaymentAmount(taxDetail.taxAmount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={{ marginTop: 8 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text variant="titleMedium">{t("total_payment_amount")}</Text>
            <Text style={{ fontSize: 18, marginTop: 8 }}>
              {convertPaymentAmount(orderSessionDetail?.paymentAmount)}
            </Text>
          </View>
          {(orderSessionDetail?.paymentDetails || []).map((paymentDetail) => (
            <Text>{`${t("payment_method")}: ${t(paymentDetail.paymentMethod)}`}</Text>
          ))}

          {/* <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
              gap: 8,
            }}
          >
            <Button style={{ flex: 1 }} mode="contained-tonal">
              Lịch sử chỉnh sửa
            </Button>
            <Button style={{ flex: 1 }} mode="contained">
              PDF
            </Button>
          </View> */}
        </View>
      </Surface>
    </>
  );
};

export default InvoiceDetailPage;
