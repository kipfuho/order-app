import { Dish } from "../../../stores/state.interface";
import {
  Card,
  Icon,
  Surface,
  Text,
  Tooltip,
  TouchableRipple,
} from "react-native-paper";
import { useWindowDimensions, View } from "react-native";
import _ from "lodash";
import { convertPaymentAmount } from "../../../constants/utils";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store";

export const DishCardForCustomer = ({ dish }: { dish: Dish }) => {
  const { width } = useWindowDimensions();
  const cardWidth = (width * 0.75 - 10) / 2 - 10;

  const cartItem = useSelector(
    (state: RootState) => state.customer.currentCartItem[dish?.id]
  );

  if (!dish) {
    return;
  }

  return (
    <Card style={{ margin: 3, width: cardWidth }}>
      <View>
        <Card.Cover
          source={{ uri: dish.imageUrls[0] || "https://picsum.photos/700" }}
          style={{ width: cardWidth, height: Math.min(cardWidth, 200) }}
        />
      </View>
      <TouchableRipple
        style={{
          position: "absolute",
          bottom: 80,
          right: 0,
          padding: 5,
          borderRadius: 5,
          zIndex: 5,
        }}
      >
        <Surface
          style={{
            borderRadius: 25,
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {_.isEmpty(cartItem) ? (
            <Icon source="plus-circle-outline" size={32} />
          ) : (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {cartItem.quantity}
            </Text>
          )}
        </Surface>
      </TouchableRipple>
      <Card.Title
        title={
          <View style={{ flex: 1 }}>
            <Tooltip title={dish.name}>
              <Text
                variant="titleLarge"
                numberOfLines={2}
                style={{ fontWeight: "semibold" }}
              >
                {dish.name}
              </Text>
            </Tooltip>
            <Text
              variant="titleLarge"
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
