import {
  Portal,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { OrderSession } from "../../../stores/state.interface";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import OrderCustomerInfo from "./OrderCutomerInfo";
import DishOrderCard from "./DishOrder";
import { useState } from "react";
import { ConfirmCancelDialog } from "../CancelDialog";
import { useCancelOrderSessionMutation } from "../../../stores/apiSlices/orderApi.slice";
import { useLocalSearchParams, useRouter } from "expo-router";
import { goToTablesForOrderList } from "../../../apis/navigate.service";
import { useDispatch } from "react-redux";
import { resetCurrentTable } from "../../../stores/shop.slice";
import Toast from "react-native-toast-message";

export default function ActiveOrderSessionPage({
  activeOrderSession,
}: {
  activeOrderSession: OrderSession | null;
}) {
  const { shopId, orderSessionId } = useLocalSearchParams() as {
    shopId: string;
    orderSessionId: string;
  };
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();

  const [cancelOrderSession, { isLoading: cancelOrderSessionLoading }] =
    useCancelOrderSessionMutation();

  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancelOrderSession = async () => {
    try {
      await cancelOrderSession({
        orderSessionId,
        reason: cancelReason,
        shopId,
      }).unwrap();

      setCancelDialogVisible(false);
      dispatch(resetCurrentTable());
      goToTablesForOrderList({
        router,
        shopId,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: error.data?.message,
      });
      return;
    }
  };

  if (!activeOrderSession) {
    return;
  }

  return (
    <>
      <Portal>
        <ConfirmCancelDialog
          title={t("cancel_order_confirmation")}
          isLoading={cancelOrderSessionLoading}
          cancelDialogVisible={cancelDialogVisible}
          setCancelDialogVisible={setCancelDialogVisible}
          onCancelClick={() => {
            setCancelReason("");
            setCancelDialogVisible(false);
          }}
          onConfirmClick={handleCancelOrderSession}
        >
          <View style={{ padding: 16 }}>
            <TextInput
              label={t("reason")}
              placeholder={`${t("enter")} ${t("reason")}`}
              mode="outlined"
              value={cancelReason}
              onChangeText={(text) => setCancelReason(text)}
            />
          </View>
        </ConfirmCancelDialog>
        <Toast />
      </Portal>
      <Surface style={{ flex: 1, padding: 12, borderRadius: 10 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Surface style={{ flex: 1 }}>
            <OrderCustomerInfo orderSession={activeOrderSession} />
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              <TouchableRipple
                onPress={() => {}}
                style={{
                  flex: 1,
                  borderRadius: 4,
                  backgroundColor: theme.colors.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ textAlign: "center", color: theme.colors.onPrimary }}
                  numberOfLines={2}
                >
                  {t("add_product")}
                </Text>
              </TouchableRipple>
              <TouchableRipple
                onPress={() => setCancelDialogVisible(true)}
                style={{
                  flex: 1,
                  borderRadius: 4,
                  backgroundColor: theme.colors.errorContainer,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: theme.colors.onErrorContainer,
                  }}
                  numberOfLines={2}
                >
                  {t("cancel")}
                </Text>
              </TouchableRipple>
            </View>

            {activeOrderSession.orders.map((order, idx) => (
              <Surface key={order.id} style={{ marginTop: 10, gap: 10 }}>
                <Text style={{ alignSelf: "flex-end" }}>
                  {t("times")}: {idx + 1}
                </Text>
                {order.dishOrders.map((dishOrder) => (
                  <DishOrderCard
                    key={dishOrder.id}
                    order={order}
                    dishOrder={dishOrder}
                  />
                ))}
              </Surface>
            ))}
          </Surface>
        </ScrollView>
      </Surface>
    </>
  );
}
