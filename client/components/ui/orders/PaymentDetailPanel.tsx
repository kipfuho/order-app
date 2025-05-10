import { useTranslation } from "react-i18next";
import { OrderSession } from "../../../stores/state.interface";
import {
  ActivityIndicator,
  Divider,
  Portal,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import _ from "lodash";
import {
  FlatList,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { convertPaymentAmount } from "../../../constants/utils";
import { useState } from "react";
import Toast from "react-native-toast-message";
import DiscountModal from "./DiscountModal";
import {
  useDiscountOrderSessionMutation,
  useRemoveDiscountFromOrderSessionMutation,
} from "../../../stores/apiSlices/orderApi.slice";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import { DiscountType, DiscountValueType } from "../../../constants/common";

export default function OrderSessionDetailPage({
  orderSessionDetail,
}: {
  orderSessionDetail: OrderSession | undefined;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  const { currentShop } = useSelector((state: RootState) => state.shop);

  const [discountOrderSession, { isLoading: discountOrderSessionLoading }] =
    useDiscountOrderSessionMutation();
  const [removeDiscount, { isLoading: removeDiscountLoading }] =
    useRemoveDiscountFromOrderSessionMutation();

  const [discountModalVisible, setDiscountModalVisible] = useState(false);

  const applyDiscount = async ({
    discountAfterTax,
    discountReason,
    discountValue,
    discountType,
  }: {
    discountAfterTax: boolean;
    discountReason: string;
    discountValue: string;
    discountType: DiscountValueType;
  }) => {
    if (!orderSessionDetail || !currentShop || discountOrderSessionLoading) {
      return;
    }

    await discountOrderSession({
      shopId: currentShop.id,
      orderSessionId: orderSessionDetail.id,
      discountAfterTax,
      discountReason,
      discountValue: _.toNumber(discountValue),
      discountType,
    }).unwrap();
  };

  const removeDiscountOnInvoice = async () => {
    if (!orderSessionDetail || !currentShop || removeDiscountLoading) {
      return;
    }

    const discount = _.find(
      orderSessionDetail.discounts,
      (d) => d.discountType === DiscountType.INVOICE
    );

    if (!discount) {
      return;
    }

    await removeDiscount({
      shopId: currentShop.id,
      orderSessionId: orderSessionDetail.id,
      discountId: discount.id,
    }).unwrap();
  };

  if (!orderSessionDetail) {
    return;
  }

  const dishOrders = _.get(orderSessionDetail, "orders.0.dishOrders", []);

  return (
    <>
      <Portal>
        <DiscountModal
          visible={discountModalVisible}
          onDismiss={() => setDiscountModalVisible(false)}
          onApply={applyDiscount}
          isLoading={discountOrderSessionLoading}
        />
        <Toast />
      </Portal>
      <Surface
        mode="flat"
        style={{
          flex: 1,
          padding: 8,
          borderRadius: 10,
        }}
      >
        <ScrollView style={{ maxHeight: height, padding: 8 }}>
          <Surface mode="flat" style={{ flex: 1 }}>
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

            <FlatList
              data={dishOrders}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginVertical: 4,
                  }}
                >
                  <Text style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ fontSize: 16 }}>{item.quantity}</Text>
                    <Text style={{ marginLeft: 4, fontSize: 16 }}>x</Text>
                    <Text style={{ marginLeft: 8, fontSize: 16 }}>
                      {item.name}
                    </Text>
                  </Text>
                  <Text style={{ fontSize: 16 }}>
                    {convertPaymentAmount(item.price)}
                  </Text>
                </View>
              )}
            />

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
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Text style={{ fontSize: 16 }}>{t("discount")}</Text>
                <TouchableOpacity onPress={() => setDiscountModalVisible(true)}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: theme.colors.error,
                      textDecorationLine: "underline",
                    }}
                  >
                    {t("edit")}
                  </Text>
                </TouchableOpacity>
                {orderSessionDetail.totalDiscountAmountAfterTax > 0 && (
                  <View>
                    {removeDiscountLoading ? (
                      <ActivityIndicator size={18} />
                    ) : (
                      <TouchableOpacity onPress={removeDiscountOnInvoice}>
                        <Text
                          style={{
                            fontSize: 16,
                            color: theme.colors.error,
                            textDecorationLine: "underline",
                          }}
                        >
                          {t("delete")}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 16 }}>
                {convertPaymentAmount(
                  orderSessionDetail.totalDiscountAmountAfterTax
                )}
              </Text>
            </View>

            <FlatList
              data={orderSessionDetail.taxDetails || []}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 6,
                    marginLeft: 16,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{`${t("tax")}(${
                    item.taxRate
                  }%)`}</Text>
                  <Text style={{ fontSize: 16 }}>
                    {convertPaymentAmount(item.taxAmount)}
                  </Text>
                </View>
              )}
            />

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
    </>
  );
}
