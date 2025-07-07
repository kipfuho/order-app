import _ from "lodash";
import React, { memo, useState, useCallback } from "react";
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
import { CrossPlatformImage } from "@/components/CrossPlatformImage";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { RootState } from "@stores/store";
import { updateCurrentOrder } from "@stores/shop.slice";
import { Dish, DishOrder } from "@stores/state.interface";
import { convertPaymentAmount } from "@constants/utils";
import { DishStatus } from "@constants/common";
import toastConfig from "@/components/CustomToast";

// === Quantity Control ===
const QuantityControl = memo(
  ({
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

    const handleDecrease = useCallback(() => {
      if ((currentOrder.quantity ?? 0) > 0) {
        dispatch(
          updateCurrentOrder({ dish, quantity: currentOrder.quantity! - 1 }),
        );
      }
    }, [dispatch, dish, currentOrder.quantity]);

    const handleIncrease = useCallback(() => {
      dispatch(
        updateCurrentOrder({
          dish,
          quantity: (currentOrder.quantity ?? 0) + 1,
        }),
      );
    }, [dispatch, dish, currentOrder.quantity]);

    const handleUpdateDishQuantity = useCallback(() => {
      const newQuantity = _.toNumber(dishQuantity);
      if (newQuantity > 999999) {
        Toast.show({
          type: "error",
          text1: t("update_failed"),
          text2: t("error_update_quantity"),
        });
        return;
      }

      dispatch(updateCurrentOrder({ dish, quantity: newQuantity }));
      setDialogVisible(false);
    }, [dishQuantity, dispatch, dish, t]);

    if (currentOrder.quantity === 0) return null;

    return (
      <>
        <Portal>
          <Dialog
            visible={dialogVisible}
            style={styles.dialog}
            onDismiss={() => setDialogVisible(false)}
          >
            <Dialog.Title>{t("update_dish_quantity")}</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Quantity"
                mode="outlined"
                keyboardType="numeric"
                value={dishQuantity}
                onChangeText={(text) =>
                  setDishQuantity(text.replace(/[^0-9.]/g, ""))
                }
                style={styles.dialogInput}
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

        <Surface style={styles.quantityContainer}>
          <IconButton
            mode="contained"
            icon="minus"
            onPress={handleDecrease}
            size={15}
            style={styles.iconButton}
          />
          <Pressable
            style={styles.pressableQuantity}
            onPress={() => setDialogVisible(true)}
          >
            <Text style={styles.quantityText}>{currentOrder.quantity}</Text>
          </Pressable>
          <IconButton
            mode="contained"
            icon="plus"
            onPress={handleIncrease}
            size={15}
            style={styles.iconButton}
          />
        </Surface>
      </>
    );
  },
);
QuantityControl.displayName = "QuantityControl";

// === Dish Card ===
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

  const increaseDishQuantity = useCallback(() => {
    dispatch(updateCurrentOrder({ dish }));
  }, [dispatch, dish]);

  if (cardWidth < 1) return null;

  return (
    <Card
      mode="contained"
      style={[styles.card, { width: cardWidth }]}
      onPress={increaseDishQuantity}
      disabled={dish.status === DishStatus.deactivated}
    >
      {dish.status === DishStatus.deactivated && (
        <View style={[styles.overlay, { width: cardWidth, height: cardWidth }]}>
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: theme.colors.inverseSurface, opacity: 0.5 },
            ]}
          />
          <Text
            style={[
              styles.soldOutText,
              { color: theme.colors.inverseOnSurface },
            ]}
          >
            {t("sold_out")}
          </Text>
        </View>
      )}
      <Surface style={styles.priceTag}>
        <Text style={styles.priceText}>{convertPaymentAmount(dish.price)}</Text>
      </Surface>
      <View>
        <CrossPlatformImage
          source={{ uri: dish.imageUrls[0] }}
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          defaultSource={require("@assets/images/savora.png")}
          style={{ width: cardWidth, height: cardWidth }}
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

// === Styles ===
const styles = StyleSheet.create({
  card: {
    margin: 3,
    height: 250,
  },
  overlay: {
    position: "absolute",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  soldOutText: {
    opacity: 1,
    fontWeight: "bold",
    fontSize: 24,
  },
  priceTag: {
    position: "absolute",
    top: 5,
    right: 5,
    padding: 5,
    borderRadius: 5,
    zIndex: 5,
  },
  priceText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  quantityContainer: {
    position: "absolute",
    bottom: 5,
    padding: 5,
    borderRadius: 10,
    alignSelf: "center",
    alignItems: "center",
    width: "95%",
    flexDirection: "row",
    justifyContent: "space-between",
    minWidth: 120,
  },
  iconButton: {
    padding: 0,
    margin: 0,
  },
  pressableQuantity: {
    flex: 1,
    alignItems: "center",
  },
  quantityText: {
    fontWeight: "bold",
    maxWidth: "auto",
  },
  dialog: {
    width: "80%",
    maxWidth: 500,
    alignSelf: "center",
  },
  dialogInput: {
    flex: 1,
    minWidth: 40,
  },
});
