import { t } from "i18next";
import { DishOrder, UnconfirmedOrder } from "../../../stores/state.interface";
import { memo, useEffect, useRef, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { View } from "react-native";
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
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { convertPaymentAmount } from "../../../constants/utils";
import {
  useApproveUnconfirmedOrderMutation,
  useCancelUnconfirmedOrderMutation,
  useUpdateUnconfirmedOrderMutation,
} from "../../../stores/apiSlices/orderApi.slice";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import Toast from "react-native-toast-message";
import _ from "lodash";

export const UnconfirmedOrderCard = memo(
  ({ unconfirmedOrder }: { unconfirmedOrder: UnconfirmedOrder }) => {
    const theme = useTheme();

    const { currentShop } = useSelector((state: RootState) => state.shop);

    const [
      approveUnconfirmedOrder,
      { isLoading: approveUnconfirmedOrderLoading },
    ] = useApproveUnconfirmedOrderMutation();
    const [
      updateUnconfirmedOrder,
      { isLoading: updateUnconfirmedOrderLoading },
    ] = useUpdateUnconfirmedOrderMutation();
    const [
      cancelUnconfirmedOrder,
      { isLoading: cancelUnconfirmedOrderLoading },
    ] = useCancelUnconfirmedOrderMutation();

    const isOpen = useSharedValue(1); // 1 = open, 0 = closed
    const contentHeight = useSharedValue(0);
    const contentRef = useRef<View>(null);
    const [selectedDishOrder, setSelectedDishOrder] = useState<DishOrder>();
    const [selectedDishOrderQuantity, setSelectedDishOrderQuantity] =
      useState("");
    const [selectedDishOrderNote, setSelectedDishOrderNote] = useState("");
    const [dialogVisible, setDialogVisble] = useState(false);

    const animatedContainerStyle = useAnimatedStyle(() => ({
      height: interpolate(isOpen.value, [0, 1], [0, contentHeight.value]),
      opacity: isOpen.value,
      overflow: "hidden",
    }));

    const animatedIconStyle = useAnimatedStyle(() => ({
      transform: [
        { rotate: `${interpolate(isOpen.value, [0, 1], [0, 90])}deg` },
      ],
    }));

    const measureContentHeight = () => {
      const node = contentRef.current;
      if (node) {
        node.measure((_x, _y, _width, height) => {
          runOnUI(() => {
            contentHeight.value = height;
          })();
        });
      }
    };

    const handleToggle = () => {
      measureContentHeight(); // recalculate before animation
      isOpen.value = withTiming(isOpen.value === 1 ? 0 : 1, { duration: 300 });
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
          <Toast />
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
              ref={contentRef}
              style={{
                paddingTop: 12,
                gap: 12,
              }}
              onLayout={measureContentHeight}
            >
              <FlatList
                data={unconfirmedOrder.dishOrders || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={{ gap: 4 }}>
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
                contentContainerStyle={{ gap: 12, padding: 16 }}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </Animated.View>
          {/* Dish section */}
        </Surface>
      </>
    );
  }
);
