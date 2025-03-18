import { Text } from "react-native";
import { Dish } from "../../../stores/state.interface";
import { styles } from "../../../app/_layout";

export const DishCard = ({ dish }: { dish: Dish }) => {
  return <Text style={styles.dishItem}>{dish.name}</Text>;
};
