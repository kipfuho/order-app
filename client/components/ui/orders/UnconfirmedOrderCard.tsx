import _ from "lodash";
import { memo, useEffect, useMemo, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  Icon,
  Portal,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { DishOrder, UnconfirmedOrder } from "@stores/state.interface";
import { convertPaymentAmount } from "@constants/utils";
import {
  useApproveUnconfirmedOrderMutation,
  useCancelUnconfirmedOrderMutation,
  useUpdateUnconfirmedOrderMutation,
} from "@stores/apiSlices/orderApi.slice";
import { RootState } from "@stores/store";
import toastConfig from "@/components/CustomToast";
import { FlashList } from "@shopify/flash-list";

const UnconfirmedOrderCard = ({
  unconfirmedOrder,
}: {
  unconfirmedOrder: UnconfirmedOrder;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { currentShop } = useSelector((state: RootState) => state.shop);

  const [
    approveUnconfirmedOrder,
    { isLoading: approveUnconfirmedOrderLoading },
  ] = useApproveUnconfirmedOrderMutation();
  const [updateUnconfirmedOrder, { isLoading: updateUnconfirmedOrderLoading }] =
    useUpdateUnconfirmedOrderMutation();
  const [cancelUnconfirmedOrder, { isLoading: cancelUnconfirmedOrderLoading }] =
    useCancelUnconfirmedOrderMutation();

  const isOpen = useSharedValue(1); // 1 = open, 0 = closed
  const contentHeight = useSharedValue(0);
  const [selectedDishOrder, setSelectedDishOrder] = useState<DishOrder>();
  const [selectedDishOrderQuantity, setSelectedDishOrderQuantity] =
    useState("");
  const [selectedDishOrderNote, setSelectedDishOrderNote] = useState("");
  const [dialogVisible, setDialogVisble] = useState(false);

  const flashListHeight = useMemo(() => {
    const trueHeight = 42 + unconfirmedOrder.dishOrders.length * 72;
    return Math.min(trueHeight, 500); // padding + items
  }, [unconfirmedOrder]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: interpolate(isOpen.value, [0, 1], [0, contentHeight.value]),
    opacity: isOpen.value,
    overflow: "hidden",
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(isOpen.value, [0, 1], [0, 90])}deg` }],
  }));

  const measureContentHeight = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      contentHeight.value = height;
      if (isOpen.value === 0) {
        isOpen.value = withTiming(1, { duration: 300 });
      }
    }
  };

  const handleToggle = () => {
    if (contentHeight.value > 0) {
      isOpen.value = withTiming(isOpen.value === 1 ? 0 : 1, { duration: 300 });
    }
  };

  const isLoading = () =>
    approveUnconfirmedOrderLoading ||
    updateUnconfirmedOrderLoading ||
    cancelUnconfirmedOrderLoading;

  const onConfirmClick = async () => {
    if (!currentShop || isLoading()) {
      return;
    }

    await approveUnconfirmedOrder({
      shopId: currentShop.id,
      orderId: unconfirmedOrder.id,
    }).unwrap();
  };

  const onCancelClick = async () => {
    if (!currentShop || isLoading()) {
      return;
    }

    await cancelUnconfirmedOrder({
      shopId: currentShop.id,
      orderId: unconfirmedOrder.id,
    }).unwrap();
  };

  const onUpdateClick = async () => {
    if (!currentShop || !selectedDishOrder || isLoading()) {
      return;
    }

    await updateUnconfirmedOrder({
      shopId: currentShop.id,
      orderId: unconfirmedOrder.id,
      updateDishOrders: [
        {
          dishOrderId: selectedDishOrder.id,
          quantity: _.toNumber(selectedDishOrderQuantity),
          note: selectedDishOrderNote,
        },
      ],
    }).unwrap();

    setDialogVisble(false);
  };

  useEffect(() => {
    if (!selectedDishOrder) {
      return;
    }

    setSelectedDishOrderQuantity(selectedDishOrder.quantity.toString());
    setSelectedDishOrderNote(selectedDishOrder.note || "");
  }, [selectedDishOrder]);

  return (
    <>
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisble(false)}
        >
          <Dialog.Title>{selectedDishOrder?.name}</Dialog.Title>
          <View style={{ padding: 16, gap: 8 }}>
            <TextInput
              mode="outlined"
              placeholder={t("new_quantity")}
              value={selectedDishOrderQuantity}
              keyboardType="numeric"
              onChangeText={(text) =>
                setSelectedDishOrderQuantity(text.replace(/[^0-9.]/g, ""))
              }
            />
            <TextInput
              mode="outlined"
              placeholder={t("note")}
              value={selectedDishOrderNote}
              onChangeText={setSelectedDishOrderNote}
            />
          </View>
          <Dialog.Actions>
            <Button
              mode="contained"
              disabled={isLoading()}
              onPress={onUpdateClick}
            >
              {t("confirm")}
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Toast config={toastConfig} />
      </Portal>
      <Surface
        style={{
          padding: 12,
          borderRadius: 8,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            zIndex: 1, // make sure it's above any content overflow
          }}
          onPress={handleToggle}
          activeOpacity={1}
        >
          <View style={{ flex: 1, gap: 12 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <Icon source="account" size={24} color={theme.colors.error} />
                <View>
                  <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                    {unconfirmedOrder.customer?.name ?? t("guest")}
                  </Text>
                  <Text>
                    {t("address")}: {unconfirmedOrder.customer?.address}
                  </Text>
                  <Text>
                    {t("customer_number")}:{" "}
                    {unconfirmedOrder.numberOfCustomer || 1}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  alignItems: "flex-end",
                }}
              >
                <Text style={{ color: theme.colors.primary, fontSize: 14 }}>
                  {unconfirmedOrder.createdAt}
                </Text>
                <Text style={{ fontSize: 18 }}>
                  {unconfirmedOrder.customer?.phone}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
                <Button
                  mode="contained"
                  buttonColor={theme.colors.primaryContainer}
                  textColor={theme.colors.onPrimaryContainer}
                  disabled={isLoading()}
                  onPress={onConfirmClick}
                >
                  {t("confirm")}
                </Button>
                <Button
                  mode="contained-tonal"
                  buttonColor={theme.colors.errorContainer}
                  textColor={theme.colors.onErrorContainer}
                  disabled={isLoading()}
                  onPress={onCancelClick}
                >
                  {t("cancel")}
                </Button>
              </View>

              <View style={{ height: 32, width: 32 }}>
                <Animated.View style={animatedIconStyle}>
                  <Icon source="chevron-right" size={32} />
                </Animated.View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <Animated.View style={animatedContainerStyle}>
          <View
            style={{
              position: "absolute",
              width: "100%",
              paddingTop: 10,
              height: flashListHeight,
            }}
            onLayout={measureContentHeight}
          >
            <FlashList
              data={unconfirmedOrder.dishOrders || []}
              keyExtractor={(item) => item.id}
              estimatedItemSize={72}
              renderItem={({ item }) => (
                <View style={{ gap: 4, marginBottom: 12 }}>
                  <Text style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ fontSize: 16 }}>{item.quantity}</Text>
                    <Text style={{ marginLeft: 4, fontSize: 16 }}>x</Text>
                    <Text style={{ marginLeft: 8, fontSize: 16 }}>
                      {item.name}
                    </Text>
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {convertPaymentAmount(item.price)}
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDishOrder(item);
                      setDialogVisble(true);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.colors.error,
                      }}
                    >
                      {t("change_detail")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            />
          </View>
        </Animated.View>
      </Surface>
    </>
  );
};

export default memo(UnconfirmedOrderCard);
