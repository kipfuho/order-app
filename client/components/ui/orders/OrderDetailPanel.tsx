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
import { useMemo, useState } from "react";
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
import { FlashList } from "@shopify/flash-list";

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

  const { flatListHeight, flatListData } = useMemo(() => {
    if (!activeOrderSession?.orders) {
      return {
        flatListHeight: 0,
        flatListData: [],
      };
    }

    const orders = activeOrderSession.orders || [];
    let cumulativeSize = 0;
    const flatListData = orders.flatMap((order, index) => {
      cumulativeSize += 20 + 160 * order.dishOrders.length; // 20 for header + 160 for each dish order

      const dishOrderItems = order.dishOrders.map((dishOrder) => ({
        id: dishOrder.id,
        type: "dishOrder" as const,
        order,
        dishOrder,
      }));
      const returnedDishOrderItems = order.returnedDishOrders.map(
        (returnedDishOrder) => ({
          id: returnedDishOrder.id,
          type: "returnedDishOrder" as const,
          order,
          returnedDishOrder,
        }),
      );
      return _.compact([
        { id: `header-${index}`, type: "header" as const, index },
        ...dishOrderItems,
        returnedDishOrderItems.length > 0
          ? { id: `divider-s`, type: "divider" as const }
          : null,
        ...returnedDishOrderItems,
        returnedDishOrderItems.length > 0
          ? { id: `divider-e`, type: "divider" as const }
          : null,
        { id: `footer-${index}`, type: "footer" as const, index },
      ]);
    });

    return {
      flatListHeight: Math.min(cumulativeSize, height * 0.6),
      flatListData,
    };
  }, [activeOrderSession?.orders, height]);

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
        <View style={{ padding: 12 }}>
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
        </View>

        <View style={{ height: flatListHeight }}>
          <FlashList
            data={flatListData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
            estimatedItemSize={160}
            getItemType={(item) => item.type}
            renderItem={({ item }) => {
              switch (item.type) {
                case "header":
                  return (
                    <Text
                      style={{
                        alignSelf: "flex-end",
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      {t("times")}: {item.index + 1}
                    </Text>
                  );
                case "dishOrder":
                  return (
                    <View style={{ marginBottom: 8 }}>
                      <DishOrderCard
                        order={item.order}
                        dishOrder={item.dishOrder}
                        onQuantityClick={onDishQuantityClick}
                        onDiscountClick={onDishOrderDiscountClick}
                      />
                    </View>
                  );
                case "returnedDishOrder":
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{ fontWeight: "bold" }}
                      >{`${item.returnedDishOrder.name}: x${item.returnedDishOrder.quantity}`}</Text>
                      <Text>{item.returnedDishOrder.createdAt}</Text>
                    </View>
                  );
                case "divider":
                  return <Divider />;
                case "footer":
                  return <View style={{ marginBottom: 12 }} />;
              }
            }}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
          />
        </View>
      </Surface>
    </>
  );
}
