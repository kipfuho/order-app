import _ from "lodash";
import { memo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  Surface,
  Text,
  TextInput,
  Tooltip,
  useTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { RootState } from "@stores/store";
import { updateCurrentOrder } from "@stores/shop.slice";
import { Dish, DishOrder } from "@stores/state.interface";
import { convertPaymentAmount } from "@constants/utils";
import { BLURHASH, DishStatus } from "@constants/common";
import toastConfig from "@/components/CustomToast";

const QuantityControl = ({
  dish,
  currentOrder,
}: {
  dish: Dish;
  currentOrder: Partial<DishOrder>;
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dishQuantity, setDishQuantity] = useState(
    (currentOrder.quantity || 0).toString(),
  );

  const handleDecrease = () => {
    if (currentOrder.quantity! > 0) {
      dispatch(
        updateCurrentOrder({ dish, quantity: currentOrder.quantity! - 1 }),
      );
    }
  };

  const handleIncrease = () => {
    dispatch(
      updateCurrentOrder({ dish, quantity: currentOrder.quantity! + 1 }),
    );
  };

  const handleUpdateDishQuantity = () => {
    const newQuantity = _.toNumber(dishQuantity);
    if (newQuantity > 999999) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: t("error_update_quantity"),
      });
      return;
    }
    dispatch(
      updateCurrentOrder({
        dish,
        quantity: newQuantity,
      }),
    );
    setDialogVisible(false);
  };

  if (currentOrder.quantity === 0) {
    return;
  }

  return (
    <>
      <Portal>
        <Dialog
          visible={dialogVisible}
          style={{ width: "80%", maxWidth: 500, alignSelf: "center" }}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>{t("update_dish_quantity")}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Quantity"
              mode="outlined"
              keyboardType="numeric"
              value={dishQuantity}
              onChangeText={(text) => {
                const enteredQuantity = text.replace(/[^0-9.]/g, "");
                setDishQuantity(enteredQuantity);
              }} // Restrict input to numbers & decimal
              style={{ flex: 1, minWidth: 40 }} // Prevents shrinking
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="contained" onPress={handleUpdateDishQuantity}>
              {t("confirm")}
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Toast config={toastConfig} />
      </Portal>
      <Surface
        style={{
          position: "absolute",
          bottom: 5,
          padding: 5,
          borderRadius: 10,
          alignSelf: "center",
          alignItems: "center",
          width: "95%",
          flexDirection: "row", // Align children in a row (horizontal)
          justifyContent: "space-between", // Space between the buttons and quantity text
          minWidth: 120, // Optional: Ensure there's a minimum width
        }}
      >
        <IconButton
          mode="contained"
          icon={"minus"}
          onPress={handleDecrease}
          style={{ padding: 0, margin: 0 }}
          size={15}
        />
        <Pressable
          style={{ flex: 1, alignItems: "center" }}
          onPress={() => setDialogVisible(true)}
        >
          <Text style={{ fontWeight: "bold", maxWidth: "auto" }}>
            {currentOrder.quantity}
          </Text>
        </Pressable>
        <IconButton
          mode="contained"
          icon={"plus"}
          onPress={handleIncrease}
          style={{ padding: 0, margin: 0 }}
          size={15}
        />
      </Surface>
    </>
  );
};

const DishCardForOrder = ({
  dish,
  containerWidth = 0,
}: {
  dish: Dish;
  containerWidth?: number;
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { t } = useTranslation();

  const cardWidth = Math.min(200, containerWidth * 0.48);
  const currentOrder = useSelector(
    (state: RootState) => state.shop.currentOrder[dish.id],
  );

  const increaseDishQuantity = () => {
    dispatch(updateCurrentOrder({ dish }));
  };

  if (cardWidth < 1) {
    return;
  }

  return (
    <Card
      mode="contained"
      style={{ margin: 3, width: cardWidth, height: 250 }}
      onPress={increaseDishQuantity}
      disabled={dish.status === DishStatus.deactivated}
    >
      {dish.status === DishStatus.deactivated && (
        <View
          style={{
            position: "absolute",
            width: cardWidth,
            height: cardWidth,
            zIndex: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: theme.colors.inverseSurface,
              opacity: 0.5,
            }}
          />

          <Text
            style={{
              opacity: 1,
              color: theme.colors.inverseOnSurface,
              fontWeight: "bold",
              fontSize: 24,
            }}
          >
            {t("sold_out")}
          </Text>
        </View>
      )}
      <Surface
        style={{
          position: "absolute",
          top: 5,
          right: 5,
          padding: 5,
          borderRadius: 5,
          zIndex: 5,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          {convertPaymentAmount(dish.price)}
        </Text>
      </Surface>
      <View>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={dish.imageUrls[0] || require("@assets/images/savora.png")}
          style={{ width: cardWidth, height: cardWidth }}
          placeholder={{ blurhash: BLURHASH }}
        />
        {currentOrder && (
          <QuantityControl dish={dish} currentOrder={currentOrder} />
        )}
      </View>
      <Card.Title
        title={
          <Tooltip title={dish.name}>
            <Text numberOfLines={2}>{dish.name}</Text>
          </Tooltip>
        }
        titleNumberOfLines={5}
      />
    </Card>
  );
};

export default DishCardForOrder;
export const MemoizedDishCardForOrder = memo(DishCardForOrder);
