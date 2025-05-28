import _ from "lodash";
import { memo } from "react";
import { Pressable, View } from "react-native";
import { useDispatch } from "react-redux";
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
import { CartItem, Dish } from "@stores/state.interface";
import { convertPaymentAmount } from "@constants/utils";
import { updateCartSingleDish } from "@stores/customerSlice";
import { BLURHASH } from "@constants/common";

function QuantityControlForCustomer({
  dish,
  cartItems,
}: {
  dish: Dish;
  cartItems: CartItem[];
}) {
  const dispatch = useDispatch();
  const theme = useTheme();

  const cartItem = _.find(cartItems, (item) => item.quantity > 0);

  const handleDecrease = () => {
    if (!cartItem) return;

    if (cartItem.quantity > 0) {
      dispatch(
        updateCartSingleDish({
          id: cartItem.id,
          dish,
          quantity: cartItem.quantity - 1,
        }),
      );
    }
  };

  const handleIncrease = () => {
    dispatch(
      updateCartSingleDish({
        id: cartItem?.id,
        dish,
        quantity: (cartItem?.quantity ?? 0) + 1,
      }),
    );
  };

  return (
    <>
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
        {!cartItem || cartItem.quantity === 0 ? (
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
                {cartItem.quantity}
              </Text>
            </Pressable>
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
        )}
      </TouchableRipple>
    </>
  );
}

const DishCardForCustomer = ({
  dish,
  cartItems,
  containerWidth = 0,
}: {
  dish: Dish;
  cartItems: CartItem[];
  containerWidth?: number;
}) => {
  const theme = useTheme();
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
        <QuantityControlForCustomer dish={dish} cartItems={cartItems} />
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
