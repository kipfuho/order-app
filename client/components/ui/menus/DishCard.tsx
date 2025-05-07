import { Dish } from "../../../stores/state.interface";
import { Card, IconButton, Switch, Text, Tooltip } from "react-native-paper";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { convertPaymentAmount } from "../../../constants/utils";

export const DishCard = ({
  dish,
  openMenu,
  containerWidth = 0,
}: {
  dish: Dish;
  openMenu: (dish: Dish, event: any) => void;
  containerWidth?: number;
}) => {
  const [cardWidth, setCardWidth] = useState(300);
  const [onSale, setOnSale] = useState(false);

  const onToggleSwitch = () => setOnSale(!onSale);

  useEffect(() => {
    setCardWidth(Math.min(300, containerWidth * 0.48));
  }, [containerWidth]);

  return (
    <Card style={{ width: cardWidth }}>
      <Image
        source={
          dish.imageUrls[0]
            ? { uri: dish.imageUrls[0] }
            : require("@assets/images/savora.png")
        }
        style={{
          width: "100%",
          height: 180,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
        resizeMode="cover"
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
