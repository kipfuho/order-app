import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, useTheme, Icon, Surface } from "react-native-paper";
import { DishOrder, Order } from "../../../stores/state.interface";
import { convertPaymentAmount } from "../../../constants/utils";

const ChildDishList = () => {
  return (
    <View style={styles.itemList}>
      <Text>1 x Test 1</Text>
      <Text>1 x Test 2</Text>
    </View>
  );
};

const DishOrderStatus = () => {
  const theme = useTheme();

  return (
    <View style={styles.stepper}>
      <Icon source="clock-outline" size={24} color={theme.colors.primary} />
      <View style={styles.stepDivider} />
      <Icon
        source="check-circle-outline"
        size={24}
        color={theme.colors.primary}
      />
      <View style={styles.stepDivider} />
      <Icon source="pot-mix" size={24} color={theme.colors.primary} />
      <View style={styles.stepDivider} />
      <Icon source="noodles" size={24} color={theme.colors.primary} />
    </View>
  );
};

export default function DishOrderCard({
  order,
  dishOrder,
  onQuantityClick,
}: {
  order: Order;
  dishOrder: DishOrder;
  onQuantityClick: (
    dishOrder: DishOrder,
    orderId: string,
    newQuantity: number
  ) => void;
}) {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="outlined">
      <View style={{ padding: 16 }}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <Icon source="store-outline" size={20} />
            <Surface style={styles.quantityBadge}>
              <TouchableOpacity
                onPress={() =>
                  onQuantityClick(dishOrder, order.id, dishOrder.quantity - 1)
                }
              >
                <Icon source="minus-circle-outline" size={14} />
              </TouchableOpacity>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  color: theme.colors.primary,
                  paddingHorizontal: 5,
                }}
                onPress={() =>
                  onQuantityClick(dishOrder, order.id, dishOrder.quantity)
                }
              >
                {dishOrder.quantity}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  onQuantityClick(dishOrder, order.id, dishOrder.quantity + 1)
                }
              >
                <Icon source="plus-circle-outline" size={14} />
              </TouchableOpacity>
            </Surface>
            <Text
              variant="titleMedium"
              style={styles.dishName}
              numberOfLines={10}
            >
              {dishOrder.name}
            </Text>
          </View>

          <View style={styles.rightSection}>
            <Text variant="titleMedium" style={styles.price}>
              {convertPaymentAmount(dishOrder.price)}
            </Text>
            <Text style={styles.timestamp}>{order.createdAt}</Text>
          </View>
        </View>
        {/* <ChildDishList /> */}
        {/* <DishOrderStatus /> */}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    flex: 1, // Take available space
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  quantityBadge: {
    padding: 3,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  dishName: {
    fontWeight: "bold",
    flexShrink: 1, // So it doesn't push into price
    flexWrap: "wrap",
    flex: 1,
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
    maxWidth: 100, // Prevent it from shrinking
  },
  price: {
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
  },
  itemList: {
    marginTop: 8,
    gap: 2,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  stepDivider: {
    height: 2,
    flex: 1,
    backgroundColor: "#ccc",
  },
});
