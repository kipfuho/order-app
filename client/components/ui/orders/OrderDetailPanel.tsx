import {
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { DishOrder, OrderSession, Shop } from "../../../stores/state.interface";
import { useTranslation } from "react-i18next";
import { ScrollView, useWindowDimensions, View } from "react-native";
import OrderCustomerInfo from "./OrderCutomerInfo";
import DishOrderCard from "./DishOrder";
import { useState } from "react";
import { ConfirmCancelDialog } from "../CancelDialog";
import {
  useCancelOrderSessionMutation,
  useChangeDishQuantityMutation,
} from "../../../stores/apiSlices/orderApi.slice";
import { useRouter } from "expo-router";
import { goToTablesForOrderList } from "../../../apis/navigate.service";
import { useDispatch, useSelector } from "react-redux";
import { resetCurrentTable } from "../../../stores/shop.slice";
import Toast from "react-native-toast-message";
import { AppBar } from "../../AppBar";
import CreateOrder from "../CreateOrderView";
import _ from "lodash";
import { RootState } from "../../../stores/store";

export default function ActiveOrderSessionPage({
  activeOrderSession,
}: {
  activeOrderSession: OrderSession | null;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const { height } = useWindowDimensions();

  const { currentShop, currentOrderSession } = useSelector(
    (state: RootState) => state.shop
  );
  const shop = currentShop as Shop;
  const orderSession = currentOrderSession as OrderSession;

  const [cancelOrderSession, { isLoading: cancelOrderSessionLoading }] =
    useCancelOrderSessionMutation();

  const [updateDishQuantity, { isLoading: updateDishQuantityLoading }] =
    useChangeDishQuantityMutation();

  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [createOrderVisible, setCreateOrderVisible] = useState(false);
  const [dishQuantityDialogVisible, setDishQuantityDialogVisible] =
    useState(false);
  const [changeQuantityDishOrder, setChangeQuantityDishOrder] =
    useState<DishOrder>();
  const [orderId, setOrderId] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");

  const onDishQuantityClick = (
    dishOrder: DishOrder,
    orderId: string,
    newQuantity: number
  ) => {
    setChangeQuantityDishOrder(dishOrder);
    setNewQuantity(`${newQuantity}`);
    setOrderId(orderId);
    setDishQuantityDialogVisible(true);
  };

  const handleChangeDishQuantity = async () => {
    if (!changeQuantityDishOrder) return;

    try {
      await updateDishQuantity({
        orderSessionId: orderSession.id,
        // reason,
        shopId: shop.id,
        dishOrderId: changeQuantityDishOrder.id,
        newQuantity: _.toNumber(newQuantity),
        orderId,
      }).unwrap();

      setDishQuantityDialogVisible(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: error.data?.message,
      });
      return;
    }
  };

  const handleCancelOrderSession = async () => {
    try {
      await cancelOrderSession({
        orderSessionId: orderSession.id,
        reason,
        shopId: shop.id,
      }).unwrap();

      setCancelDialogVisible(false);
      dispatch(resetCurrentTable());
      goToTablesForOrderList({
        router,
        shopId: shop.id,
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
          dialogVisible={cancelDialogVisible}
          setDialogVisible={setCancelDialogVisible}
          onCancelClick={() => {
            setReason("");
            setCancelDialogVisible(false);
          }}
          onConfirmClick={handleCancelOrderSession}
        >
          <View style={{ padding: 16, paddingTop: 0 }}>
            <TextInput
              label={t("reason")}
              placeholder={`${t("enter")} ${t("reason")}`}
              mode="outlined"
              value={reason}
              onChangeText={(text) => setReason(text)}
            />
          </View>
        </ConfirmCancelDialog>
        <ConfirmCancelDialog
          title={changeQuantityDishOrder?.name || ""}
          isLoading={updateDishQuantityLoading}
          dialogVisible={dishQuantityDialogVisible}
          setDialogVisible={setDishQuantityDialogVisible}
          onCancelClick={() => {
            setReason("");
            setDishQuantityDialogVisible(false);
          }}
          onConfirmClick={handleChangeDishQuantity}
        >
          <View style={{ padding: 16, paddingTop: 0 }}>
            <Text style={{ fontSize: 16 }}>
              {t("current_quantity")}:{" "}
              <Text
                style={{
                  fontWeight: "bold",
                  color: theme.colors.secondary,
                  textDecorationLine: "line-through",
                }}
              >
                {changeQuantityDishOrder?.quantity}
              </Text>{" "}
              <Text style={{ fontSize: 16, fontWeight: "600" }}>→</Text>{" "}
              <Text style={{ fontWeight: "bold", color: theme.colors.primary }}>
                {newQuantity}
              </Text>
            </Text>
            <TextInput
              label={t("new_quantity")}
              placeholder={`${t("enter")} ${t("new_quantity")}`}
              mode="outlined"
              value={newQuantity}
              keyboardType="numeric" // Shows numeric keyboard
              onChangeText={(text) =>
                setNewQuantity(text.replace(/[^0-9.]/g, ""))
              } // Restrict input to numbers & decimal
            />
            <TextInput
              label={t("reason")}
              placeholder={`${t("enter")} ${t("reason")}`}
              mode="outlined"
              value={reason}
              onChangeText={(text) => setReason(text)}
            />
          </View>
        </ConfirmCancelDialog>
        <Modal
          visible={createOrderVisible}
          onDismiss={() => setCreateOrderVisible(false)}
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <CreateOrder
            setCreateOrderVisible={setCreateOrderVisible}
            goBack={() => setCreateOrderVisible(false)}
          />
        </Modal>
        <Toast />
      </Portal>
      <Surface mode="flat" style={{ flex: 1, padding: 12, borderRadius: 10 }}>
        <ScrollView
          style={{ flex: 1, maxHeight: height }}
          showsVerticalScrollIndicator={false}
        >
          <Surface mode="flat" style={{ flex: 1 }}>
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
                onPress={() => setCreateOrderVisible(true)}
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
              <Surface
                mode="flat"
                key={order.id}
                style={{ marginTop: 10, gap: 10 }}
              >
                <Text style={{ alignSelf: "flex-end" }}>
                  {t("times")}: {idx + 1}
                </Text>
                {order.dishOrders.map((dishOrder) => (
                  <DishOrderCard
                    key={dishOrder.id}
                    order={order}
                    dishOrder={dishOrder}
                    onQuantityClick={onDishQuantityClick}
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
