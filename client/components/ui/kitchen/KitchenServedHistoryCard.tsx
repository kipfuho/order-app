import { KitchenLog } from "@/stores/state.interface";
import { memo } from "react";
import { View } from "react-native";
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

  if (cardWidth < 1) {
    return;
  }

  return (
    <Surface
      style={{
        borderRadius: 4,
        width: cardWidth,
        height: 125,
        elevation: 3,
        backgroundColor: theme.colors.background,
        justifyContent: "space-between",
        padding: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <View style={{ width: "70%" }}>
          <Text numberOfLines={4} style={{ fontSize: 16 }}>
            {servedHistory.dishName}
          </Text>
        </View>
        <Text numberOfLines={4} style={{ fontSize: 18, fontWeight: "bold" }}>
          {servedHistory.dishQuantity}
        </Text>
      </View>
      <Text style={{ fontSize: 16 }}>{servedHistory.createdAt}</Text>
    </Surface>
  );
};

export default memo(KitchenServedHistoryCard);
