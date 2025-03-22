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

export const DishCard = ({ dish }: { dish: Dish }) => {
  const { width } = useWindowDimensions();
  const [cardWidth, setCardWidth] = useState(300);

  const [onSale, setOnSale] = useState(false);
  const onToggleSwitch = () => setOnSale(!onSale);

  useEffect(() => {
    setCardWidth(width > 600 ? 300 : width * 0.3);
  }, [width]);

  return (
    <Card style={{ margin: 10, width: cardWidth }}>
      <Card.Cover source={{ uri: "https://picsum.photos/700" }} />
      <Card.Title
        title={
          <Tooltip title={dish.name}>
            <Text numberOfLines={2}>{dish.name}</Text>
          </Tooltip>
        }
        titleNumberOfLines={2}
        subtitle={`$${dish.price}`}
        right={(props) => (
          <IconButton {...props} icon="dots-vertical" onPress={() => {}} />
        )}
      />
      <Card.Actions>
        <Surface
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ marginRight: 16 }}>On Sale</Text>
          <Switch value={onSale} onValueChange={onToggleSwitch} />
        </Surface>
      </Card.Actions>
    </Card>
  );
};
