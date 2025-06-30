import { KitchenLog } from "@/stores/state.interface";
import { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";

interface KitchenDishOrderProps {
  servedHistory: KitchenLog;
  containerWidth?: number;
}

const KitchenServedHistoryCard: React.FC<KitchenDishOrderProps> = ({
  servedHistory,
  containerWidth = 0,
}) => {
  const theme = useTheme();
  const cardWidth = Math.min(200, containerWidth * 0.48);

  if (cardWidth < 1) return null;

  return (
    <Surface
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.nameContainer}>
          <Text numberOfLines={4} style={styles.dishName}>
            {servedHistory.dishName}
          </Text>
        </View>
        <Text numberOfLines={4} style={styles.quantity}>
          {servedHistory.dishQuantity}
        </Text>
      </View>
      <Text style={styles.createdAt}>{servedHistory.createdAt}</Text>
    </Surface>
  );
};

export default memo(KitchenServedHistoryCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 4,
    height: 125,
    elevation: 3,
    justifyContent: "space-between",
    padding: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  nameContainer: {
    width: "70%",
  },
  dishName: {
    fontSize: 16,
  },
  quantity: {
    fontSize: 18,
    fontWeight: "bold",
  },
  createdAt: {
    fontSize: 16,
  },
});
