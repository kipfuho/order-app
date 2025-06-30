import { KitchenLog } from "@/stores/state.interface";
import { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";

interface KitchenDishOrderProps {
  cookedHistory: KitchenLog;
  containerWidth?: number;
}

const KitchenCookedHistoryCard: React.FC<KitchenDishOrderProps> = ({
  cookedHistory,
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
            {cookedHistory.dishName}
          </Text>
        </View>
        <Text numberOfLines={4} style={styles.quantity}>
          {cookedHistory.dishQuantity}
        </Text>
      </View>
      <Text style={styles.createdAt}>{cookedHistory.createdAt}</Text>
    </Surface>
  );
};

export default memo(KitchenCookedHistoryCard);

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
