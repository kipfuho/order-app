import { Dish } from "../../../stores/state.interface";
import {
  Card,
  IconButton,
  Surface,
  Switch,
  Text,
  Tooltip,
} from "react-native-paper";
import { useWindowDimensions } from "react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { convertPaymentAmount } from "../../../constants/utils";

export const DishCard = ({
  dish,
  openMenu,
}: {
  dish: Dish;
  openMenu: (dish: Dish, event: any) => void;
}) => {
  const { width } = useWindowDimensions();
  const [cardWidth, setCardWidth] = useState(300);
  const [onSale, setOnSale] = useState(false);

  const onToggleSwitch = () => setOnSale(!onSale);

  useEffect(() => {
    setCardWidth(width > 600 ? 300 : width * 0.6);
  }, [width]);

  return (
    <Card style={{ width: cardWidth }}>
      <Card.Cover
        source={{ uri: dish.imageUrls[0] || "https://picsum.photos/700" }}
      />
      <Card.Title
        title={
          <Tooltip title={dish.name} leaveTouchDelay={100}>
            <Text numberOfLines={2} style={{ fontSize: 16 }}>
              {dish.name}
            </Text>
          </Tooltip>
        }
        titleNumberOfLines={2}
        subtitle={
          <Tooltip
            title={convertPaymentAmount(dish.price)}
            leaveTouchDelay={100}
          >
            <Text numberOfLines={1} style={{ fontSize: 16 }}>
              {convertPaymentAmount(dish.price)}
            </Text>
          </Tooltip>
        }
        right={(props) => (
          <IconButton
            {...props}
            icon="dots-vertical"
            onPress={(event) => openMenu(dish, event)}
          />
        )}
        style={{ paddingLeft: 8 }}
      />
      <Card.Actions>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            margin: 0,
          }}
        >
          <Text>On Sale</Text>
          <Switch value={onSale} onValueChange={onToggleSwitch} />
        </View>
      </Card.Actions>
    </Card>
  );
};
