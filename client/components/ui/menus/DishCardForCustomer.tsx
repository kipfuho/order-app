import { memo } from "react";
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

function QuantityControlForCustomer({ dish }: { dish: Dish }) {
  const dispatch = useDispatch();
  const theme = useTheme();

  const cartItemByDish = useSelector(
    (state: RootState) => state.customer.cartItemByDishId[dish.id],
  );

  const handleDecrease = () => {
    if (!cartItemByDish) return;

    if (cartItemByDish.quantity > 0) {
      dispatch(
        updateCartSingleDish({
          id: cartItemByDish.id,
          dish,
          quantity: cartItemByDish.quantity - 1,
        }),
      );
    }
  };

  const handleIncrease = () => {
    dispatch(
      updateCartSingleDish({
        id: cartItemByDish?.id,
        dish,
        quantity: (cartItemByDish?.quantity ?? 0) + 1,
      }),
    );
  };
  if (
    dish.status === DishStatus.deactivated &&
    (!cartItemByDish || cartItemByDish.quantity === 0)
  ) {
    return;
  }

  return (
    <TouchableRipple
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        padding: 5,
        borderRadius: 5,
        zIndex: 5,
      }}
    >
      {!cartItemByDish || cartItemByDish.quantity === 0 ? (
        <Surface style={{ padding: 4, borderRadius: 20 }}>
          <TouchableRipple
            style={{
              backgroundColor: theme.colors.onBackground,
              borderRadius: 20,
            }}
            onPress={handleIncrease}
          >
            <Icon source="plus" size={24} color={theme.colors.background} />
          </TouchableRipple>
        </Surface>
      ) : (
        <Surface
          style={{
            padding: 4,
            borderRadius: 20,
            alignSelf: "center",
            alignItems: "center",
            width: "auto",
            flexDirection: "row", // Align children in a row (horizontal)
            justifyContent: "space-between", // Space between the buttons and quantity text
            flex: 1,
            flexWrap: "wrap",
          }}
        >
          <TouchableRipple
            style={{
              backgroundColor: theme.colors.onBackground,
              borderRadius: 20,
            }}
            onPress={handleDecrease}
          >
            <Icon source="minus" size={24} color={theme.colors.background} />
          </TouchableRipple>
          <Pressable
            style={{ flex: 1, alignItems: "center" }}
            onPress={() => {
              // do sth here
            }}
          >
            <Text
              style={{
                maxWidth: "auto",
                paddingHorizontal: 5,
                fontSize: 18,
              }}
            >
              {cartItemByDish.quantity}
            </Text>
          </Pressable>
          {dish.status !== DishStatus.deactivated && (
            <TouchableRipple
              style={{
                backgroundColor: theme.colors.onBackground,
                borderRadius: 20,
              }}
              onPress={handleIncrease}
            >
              <Icon source="plus" size={24} color={theme.colors.background} />
            </TouchableRipple>
          )}
        </Surface>
      )}
    </TouchableRipple>
  );
}

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

  if (!dish || cardWidth < 1) {
    return;
  }

  return (
    <Card
      style={{
        margin: 3,
        width: cardWidth,
        height: 294,
        backgroundColor: theme.colors.background,
        borderRadius: 5,
      }}
      mode="contained"
    >
      <View>
        <Image
          source={dish.imageUrls[0] || require("@assets/images/savora.png")}
          placeholder={{ blurhash: BLURHASH }}
          style={{
            width: cardWidth,
            height: cardWidth,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
        {dish.status === DishStatus.deactivated && (
          <View
            style={{
              position: "absolute",
              width: cardWidth,
              height: cardWidth,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: theme.colors.inverseSurface,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
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
        <QuantityControlForCustomer dish={dish} />
      </View>
      <Card.Title
        title={
          <View style={{ flex: 1 }}>
            <Tooltip title={dish.name}>
              <Text
                variant="titleMedium"
                numberOfLines={2}
                style={{ fontWeight: "semibold" }}
              >
                {dish.name}
              </Text>
            </Tooltip>
            <Text
              variant="titleMedium"
              numberOfLines={1}
              style={{ fontWeight: "semibold" }}
            >
              {convertPaymentAmount(dish.price)}
            </Text>
          </View>
        }
        titleNumberOfLines={5}
        style={{ marginVertical: 10 }}
      />
    </Card>
  );
};

export default DishCardForCustomer;
export const MemoizedDishCardForCustomer = memo(DishCardForCustomer);
