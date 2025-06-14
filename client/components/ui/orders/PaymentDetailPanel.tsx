import _ from "lodash";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Divider,
  Portal,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useState } from "react";
import { TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSelector } from "react-redux";
import { LegendList } from "@legendapp/list";
import Toast from "react-native-toast-message";
import { convertPaymentAmount } from "@constants/utils";
import DiscountModal from "./DiscountModal";
import {
  useDiscountOrderSessionMutation,
  useRemoveDiscountFromOrderSessionMutation,
} from "@stores/apiSlices/orderApi.slice";
import { RootState } from "@stores/store";
import { DiscountType, DiscountValueType } from "@constants/common";
import { OrderSession } from "@stores/state.interface";
import toastConfig from "@/components/CustomToast";

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

    setDiscountModalVisible(false);
  };

  const removeDiscountOnInvoice = async () => {
    if (!orderSessionDetail || !currentShop || removeDiscountLoading) {
      return;
    }

    const discount = _.find(
      orderSessionDetail.discounts,
      (d) => d.discountType === DiscountType.INVOICE,
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
        <Toast config={toastConfig} />
      </Portal>
      <Surface mode="flat" style={{ flex: 1, borderRadius: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            flexWrap: "wrap",
            padding: 12,
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

        <Divider style={{ marginVertical: 8 }} />

        <LegendList
          data={dishOrders}
          style={{ maxHeight: height * 0.6, padding: 12 }}
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
                <Text style={{ marginLeft: 8, fontSize: 16 }}>{item.name}</Text>
              </Text>
              <Text style={{ fontSize: 16 }}>
                {convertPaymentAmount(item.price)}
              </Text>
            </View>
          )}
        />

        <Divider style={{ marginVertical: 8 }} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            paddingVertical: 6,
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
            paddingHorizontal: 12,
            paddingVertical: 6,
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
          </View>
          <Text style={{ fontSize: 16 }}>
            {convertPaymentAmount(
              orderSessionDetail.afterTaxTotalDiscountAmount,
            )}
          </Text>
        </View>

        {(orderSessionDetail.discounts || []).map((discount) => (
          <View
            key={discount.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginLeft: 16,
              paddingHorizontal: 12,
              paddingBottom: 6,
            }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text>{discount.name}</Text>
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
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 14 }}>
                {convertPaymentAmount(discount.beforeTaxTotalDiscountAmount)}
              </Text>
              {discount.taxTotalDiscountAmount > 0 && (
                <Text style={{ fontSize: 12 }}>
                  (VAT:{" "}
                  {convertPaymentAmount(discount.afterTaxTotalDiscountAmount)})
                </Text>
              )}
            </View>
          </View>
        ))}

        {(orderSessionDetail.taxDetails || []).map((taxDetail) => (
          <View
            key={taxDetail.taxRate}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 6,
              marginLeft: 16,
              paddingHorizontal: 12,
              paddingVertical: 6,
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
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontSize: 16 }}>{t("tax")}</Text>
          <Text style={{ fontSize: 16 }}>
            {convertPaymentAmount(orderSessionDetail.totalTaxAmount)}
          </Text>
        </View>
      </Surface>
    </>
  );
}
