import React, { memo, useCallback } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Icon,
  Surface,
  Text,
  Tooltip,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { Dish } from "@stores/state.interface";
import { convertPaymentAmount } from "@constants/utils";
import { updateCartSingleDish } from "@stores/customerSlice";
import { BLURHASH, DishStatus } from "@constants/common";
import { useTranslation } from "react-i18next";
import { RootState } from "@/stores/store";

// ====== Quantity Control Subcomponent ======
const QuantityControlForCustomer = memo(({ dish }: { dish: Dish }) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const cartItemByDish = useSelector(
    (state: RootState) => state.customer.cartItemByDishId[dish.id],
  );

  const handleDecrease = useCallback(() => {
    if (!cartItemByDish || cartItemByDish.totalQuantity <= 0) return;

    dispatch(
      updateCartSingleDish({
        id: cartItemByDish.id,
        dish,
        quantity: cartItemByDish.newQuantity - 1,
      }),
    );
  }, [cartItemByDish, dispatch, dish]);

  const handleIncrease = useCallback(() => {
    dispatch(
      updateCartSingleDish({
        id: cartItemByDish?.id,
        dish,
        quantity: (cartItemByDish?.newQuantity ?? 0) + 1,
      }),
    );
  }, [cartItemByDish, dispatch, dish]);

  if (
    dish.status === DishStatus.deactivated &&
    (!cartItemByDish || cartItemByDish.newQuantity === 0)
  ) {
    return null;
  }

  return (
    <TouchableRipple style={styles.controlRoot}>
      {!cartItemByDish || cartItemByDish.totalQuantity === 0 ? (
        <Surface style={styles.controlSurface}>
          <TouchableRipple
            style={[
              styles.iconButton,
              { backgroundColor: theme.colors.onBackground },
            ]}
            onPress={handleIncrease}
          >
            <Icon source="plus" size={24} color={theme.colors.background} />
          </TouchableRipple>
        </Surface>
      ) : (
        <Surface style={styles.quantityContainer}>
          {cartItemByDish.newQuantity > 0 && (
            <TouchableRipple
              style={[
                styles.iconButton,
                { backgroundColor: theme.colors.onBackground },
              ]}
              onPress={handleDecrease}
            >
              <Icon source="minus" size={24} color={theme.colors.background} />
            </TouchableRipple>
          )}
          <Pressable style={styles.quantityPressable} onPress={() => {}}>
            <Text style={styles.quantityText}>
              {cartItemByDish.totalQuantity}
            </Text>
          </Pressable>
          {dish.status !== DishStatus.deactivated && (
            <TouchableRipple
              style={[
                styles.iconButton,
                { backgroundColor: theme.colors.onBackground },
              ]}
              onPress={handleIncrease}
            >
              <Icon source="plus" size={24} color={theme.colors.background} />
            </TouchableRipple>
          )}
        </Surface>
      )}
    </TouchableRipple>
  );
});
QuantityControlForCustomer.displayName = "QuantityControlForCustomer";

// ====== Main Card Component ======
const DishCardForCustomer = ({
  dish,
  containerWidth = 0,
}: {
  dish: Dish;
  containerWidth?: number;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const cardWidth = Math.min(200, containerWidth * 0.48);
  if (!dish || cardWidth < 1) return null;

  return (
    <Card
      style={[
        styles.card,
        { width: cardWidth, backgroundColor: theme.colors.background },
      ]}
      mode="contained"
    >
      <View>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={dish.imageUrls[0] || require("@assets/images/savora.png")}
          placeholder={{ blurhash: BLURHASH }}
          style={[styles.image, { width: cardWidth, height: cardWidth }]}
          recyclingKey={`dish-${dish.id}`} // Helps recycle image components
          cachePolicy="memory-disk" // Aggressive caching
          priority="normal" // Don't compete with high-priority images
          transition={null} // Disable transitions during scrolling
          allowDownscaling // Allow image downscaling
          contentFit="cover" // Efficient fit mode
        />
        {dish.status === DishStatus.deactivated && (
          <View
            style={[styles.overlay, { width: cardWidth, height: cardWidth }]}
          >
            <View
              style={[
                styles.overlayBg,
                {
                  backgroundColor: theme.colors.inverseSurface,
                },
              ]}
            />
            <Text
              style={[
                styles.overlayText,
                {
                  color: theme.colors.inverseOnSurface,
                },
              ]}
            >
              {t("sold_out")}
            </Text>
          </View>
        )}
        <QuantityControlForCustomer dish={dish} />
      </View>

      <Card.Title
        title={
          <View style={{ flex: 1 }}>
            <Tooltip title={dish.name}>
              <Text
                variant="titleMedium"
                numberOfLines={2}
                style={styles.textBold}
              >
                {dish.name}
              </Text>
            </Tooltip>
            <Text
              variant="titleMedium"
              numberOfLines={1}
              style={styles.textBold}
            >
              {convertPaymentAmount(dish.price)}
            </Text>
          </View>
        }
        titleNumberOfLines={5}
        style={styles.cardTitle}
      />
    </Card>
  );
};

export default DishCardForCustomer;
export const MemoizedDishCardForCustomer = memo(DishCardForCustomer);

// ====== Styles ======
const styles = StyleSheet.create({
  card: {
    margin: 3,
    height: 294,
    borderRadius: 5,
  },
  image: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  overlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  overlayText: {
    fontWeight: "bold",
    fontSize: 24,
    opacity: 1,
  },
  textBold: {
    fontWeight: "600",
  },
  cardTitle: {
    marginVertical: 10,
  },
  controlRoot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 5,
    borderRadius: 5,
    zIndex: 5,
  },
  controlSurface: {
    padding: 4,
    borderRadius: 20,
  },
  quantityContainer: {
    padding: 4,
    borderRadius: 20,
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    flexWrap: "wrap",
  },
  iconButton: {
    borderRadius: 20,
  },
  quantityPressable: {
    flex: 1,
    alignItems: "center",
  },
  quantityText: {
    maxWidth: "auto",
    paddingHorizontal: 5,
    fontSize: 18,
  },
});
