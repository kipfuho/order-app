import _ from "lodash";
import {
  Divider,
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { LegendList } from "@legendapp/list";
import Toast from "react-native-toast-message";
import OrderCustomerInfo from "./OrderCutomerInfo";
import DishOrderCard from "./DishOrder";
import { ConfirmCancelDialog } from "../CancelDialog";
import {
  useCancelOrderSessionMutation,
  useChangeDishQuantityMutation,
  useDiscountDishOrderMutation,
} from "@stores/apiSlices/orderApi.slice";
import { DishOrder, Order, OrderSession, Shop } from "@stores/state.interface";
import { goToTablesForOrderList } from "@apis/navigate.service";
import { resetCurrentTable } from "@stores/shop.slice";
import CreateOrder from "../CreateOrderView";
import { RootState } from "@stores/store";
import { DiscountValueType } from "@/constants/common";
import DiscountModal from "./DiscountModal";
import toastConfig from "@/components/CustomToast";

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
    (state: RootState) => state.shop,
  );
  const shop = currentShop as Shop;
  const orderSession = currentOrderSession as OrderSession;

  const [cancelOrderSession, { isLoading: cancelOrderSessionLoading }] =
    useCancelOrderSessionMutation();
  const [updateDishQuantity, { isLoading: updateDishQuantityLoading }] =
    useChangeDishQuantityMutation();
  const [discountDishOrder, { isLoading: discountDishOrderLoading }] =
    useDiscountDishOrderMutation();

  const [discountModalVisible, setDiscountModalVisible] = useState(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [createOrderVisible, setCreateOrderVisible] = useState(false);
  const [dishQuantityDialogVisible, setDishQuantityDialogVisible] =
    useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order>();
  const [selectedDishOrder, setSelectedDishOrder] = useState<DishOrder>();
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");

  const onDishQuantityClick = ({
    dishOrder,
    order,
    newQuantity,
  }: {
    dishOrder: DishOrder;
    order: Order;
    newQuantity: number;
  }) => {
    setNewQuantity(`${newQuantity}`);
    setSelectedOrder(order);
    setSelectedDishOrder(dishOrder);
    setDishQuantityDialogVisible(true);
  };

  const onDishOrderDiscountClick = ({
    order,
    dishOrder,
  }: {
    order: Order;
    dishOrder: DishOrder;
  }) => {
    setSelectedOrder(order);
    setSelectedDishOrder(dishOrder);
    setDiscountModalVisible(true);
  };

  const handleChangeDishQuantity = async () => {
    if (!selectedOrder || !selectedDishOrder) return;

    try {
      await updateDishQuantity({
        orderSessionId: orderSession.id,
        // reason,
        shopId: shop.id,
        dishOrderId: selectedDishOrder.id,
        newQuantity: _.toNumber(newQuantity),
        orderId: selectedOrder.id,
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
    if (
      !selectedOrder ||
      !selectedDishOrder ||
      !currentShop ||
      !currentOrderSession ||
      discountDishOrderLoading
    ) {
      return;
    }

    await discountDishOrder({
      dishOrderId: selectedDishOrder.id,
      orderId: selectedOrder.id,
      orderSessionId: currentOrderSession.id,
      shopId: currentShop.id,
      discountAfterTax,
      discountReason,
      discountValue: _.toNumber(discountValue),
      discountType,
    }).unwrap();

    setDiscountModalVisible(false);
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
          title={selectedDishOrder?.name || ""}
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
                {selectedDishOrder?.quantity}
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
        <DiscountModal
          title={`${t("discount_dish_order")} ${selectedDishOrder?.name}`}
          visible={discountModalVisible}
          onDismiss={() => setDiscountModalVisible(false)}
          onApply={applyDiscount}
          isLoading={discountDishOrderLoading}
        />
        <Toast config={toastConfig} />
      </Portal>
      <Surface mode="flat" style={{ flex: 1 }}>
        <Surface mode="flat" style={{ padding: 12 }}>
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
        </Surface>

        <LegendList
          data={activeOrderSession.orders || []}
          keyExtractor={(item) => item.id}
          style={{ maxHeight: height * 0.6, padding: 12 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item: order, index }) => (
            <Surface mode="flat" style={{ marginBottom: 12 }}>
              <Text
                style={{
                  alignSelf: "flex-end",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {t("times")}: {index + 1}
              </Text>
              <View style={{ gap: 8 }}>
                {order.dishOrders.map((dishOrder) => (
                  <DishOrderCard
                    key={dishOrder.id}
                    order={order}
                    dishOrder={dishOrder}
                    onQuantityClick={onDishQuantityClick}
                    onDiscountClick={onDishOrderDiscountClick}
                  />
                ))}
              </View>
              {!_.isEmpty(order.returnedDishOrders) && (
                <View style={{ gap: 8 }}>
                  <Divider />
                  <Text style={{ fontSize: 18, color: theme.colors.error }}>
                    {t("returned_dish")}
                  </Text>
                  {order.returnedDishOrders.map((returnedDishOrder) => (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{ fontWeight: "bold" }}
                      >{`${returnedDishOrder.name}: x${returnedDishOrder.quantity}`}</Text>
                      <Text>{returnedDishOrder.createdAt}</Text>
                    </View>
                  ))}
                  <Divider />
                </View>
              )}
            </Surface>
          )}
          nestedScrollEnabled={true}
        />
      </Surface>
    </>
  );
}
