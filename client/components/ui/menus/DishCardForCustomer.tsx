import { CartItem, Dish, Shop } from "../../../stores/state.interface";
import {
  Card,
  Icon,
  Surface,
  Text,
  Tooltip,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { Pressable, useWindowDimensions, View } from "react-native";
import _ from "lodash";
import { convertPaymentAmount } from "../../../constants/utils";
import { useDispatch } from "react-redux";
import { updateCartSingleDish } from "../../../stores/customerSlice";

function QuantityControlForCustomer({
  dish,
  cartItems,
}: {
  dish: Dish;
  cartItems: CartItem[];
}) {
  const dispatch = useDispatch();
  const theme = useTheme();

  const totalQuantity = _.sumBy(cartItems, "quantity");
  const cartItem = _.find(cartItems, (item) => item.quantity > 0);

  const handleDecrease = () => {
    if (!cartItem) return;

    if (cartItem.quantity > 0) {
      dispatch(
        updateCartSingleDish({
          id: cartItem.id,
          dish,
          quantity: cartItem.quantity - 1,
        })
      );
    }
  };

  const handleIncrease = () => {
    dispatch(
      updateCartSingleDish({
        id: cartItem?.id,
        dish,
        quantity: (cartItem?.quantity ?? 0) + 1,
      })
    );
  };

  return (
    <>
      <TouchableRipple
        style={{
          position: "absolute",
          top: 85,
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

export const DishCardForCustomer = ({
  dish,
  cartItems,
}: {
  dish: Dish;
  cartItems: CartItem[];
}) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = (width * 0.75 - 10) / 2 - 10;

  if (!dish) {
    return;
  }

  return (
    <Card
      style={{
        margin: 3,
        width: cardWidth,
        backgroundColor: theme.colors.background,
        borderRadius: 5,
      }}
      mode="contained"
    >
      <View>
        <Card.Cover
          source={{ uri: dish.imageUrls[0] || "https://picsum.photos/700" }}
          style={{
            width: cardWidth,
            height: Math.min(cardWidth, 200),
            borderRadius: 5,
          }}
        />
      </View>
      <QuantityControlForCustomer dish={dish} cartItems={cartItems} />
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
