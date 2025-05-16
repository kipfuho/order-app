import React, { memo } from "react";
import { View, Text } from "react-native";
import { Badge, Surface, useTheme } from "react-native-paper";
import { KitchenDishOrder } from "../../../stores/state.interface";
import { getStatusColor } from "../../../constants/utils";
import { CustomMD3Theme } from "../../../constants/theme";

interface KitchenDishOrderProps {
  dishOrder: KitchenDishOrder;
  containerWidth?: number;
}

const KitchenDishOrderServingCard: React.FC<KitchenDishOrderProps> = memo(
  ({ dishOrder, containerWidth = 0 }) => {
    const theme = useTheme<CustomMD3Theme>();
    const cardWidth = Math.min(200, containerWidth * 0.48);
    const color = getStatusColor(theme, 44);

    if (cardWidth < 1) {
      return;
    }

    return (
      <Surface
        style={{
          borderRadius: 4,
          width: cardWidth,
          height: cardWidth,
          elevation: 3,
          backgroundColor: theme.colors.background,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, padding: 8 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text style={{ fontSize: 24, color: theme.colors.onBackground }}>
              {dishOrder.orderSessionNo}-{dishOrder.dishOrderNo}
            </Text>
            <Badge
              style={{
                backgroundColor: theme.colors.tertiaryContainer,
                color: theme.colors.onTertiaryContainer,
                fontSize: 14,
                paddingHorizontal: 8,
                alignSelf: "center",
              }}
            >
              {dishOrder.tableName}
            </Badge>
          </View>

          <View style={{ flex: 1, overflow: "scroll" }}>
            <Text style={{ fontSize: 18, color: theme.colors.onBackground }}>
              {dishOrder.name}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: color.view,
            padding: 4,
            paddingHorizontal: 8,
            borderBottomStartRadius: 4,
            borderBottomEndRadius: 4,
          }}
        >
          <Text
            style={{
              color: color.onView,
              fontSize: 20,
            }}
            numberOfLines={1}
          >
            x {dishOrder.quantity}
          </Text>
        </View>
      </Surface>
    );
  }
);

export default KitchenDishOrderServingCard;
