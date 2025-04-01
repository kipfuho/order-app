import { Dish } from "../../../stores/state.interface";
import {
  Card,
  IconButton,
  Surface,
  Switch,
  Text,
  Tooltip,
} from "react-native-paper";
import { useWindowDimensions, View } from "react-native";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import { updateCurrentOrder } from "../../../stores/shop.slice";

export const DishCardForOrder = ({ dish }: { dish: Dish }) => {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();

  const [cardWidth, setCardWidth] = useState(300);
  const currentOrder = useSelector(
    (state: RootState) => state.shop.currentOrder[dish.id]
  );

  const increaseDishQuantity = () => {
    dispatch(updateCurrentOrder({ dish }));
  };

  useEffect(() => {
    setCardWidth(width > 600 ? 200 : width * 0.2);
  }, [width]);

  return (
    <Card
      style={{ margin: 3, width: cardWidth }}
      onPress={increaseDishQuantity}
    >
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
        <Text>{(dish.price || 0).toLocaleString()}</Text>
      </Surface>
      <View>
        <Card.Cover
          source={{ uri: dish.imageUrls[0] || "https://picsum.photos/700" }}
          style={{ width: cardWidth, height: cardWidth }}
        />
        {currentOrder?.quantity && (
          <Surface
            style={{
              position: "absolute",
              bottom: 5,
              padding: 5,
              borderRadius: 10,
              alignSelf: "center",
              alignItems: "center",
              width: "95%",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{currentOrder?.quantity}</Text>
          </Surface>
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
