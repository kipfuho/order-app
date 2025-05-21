import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import {
  Surface,
  Text,
  IconButton,
  Button,
  Divider,
  useTheme,
  Badge,
  Card,
  Icon,
} from "react-native-paper";

const OrderManagement = () => {
  const theme = useTheme();

  // Sample data for orders
  const orders = [
    {
      id: "B03",
      tableNumber: "(1)",
      location: "Indoor",
      isNew: true,
      dishes: [
        {
          id: 1,
          name: "TSUKIMI Y.SOBA",
          quantity: 1,
          type: "noodle",
          status: "Cứng",
        },
      ],
      time: "1432m",
      receipt: "Quyết 2",
    },
    {
      id: "",
      tableNumber: "(1)",
      location: "Cái gì đó",
      isNew: true,
      dishes: [
        {
          id: 1,
          name: "MISO RAMEN",
          quantity: 1,
          type: "noodle",
          status: "Cứng",
        },
        {
          id: 2,
          name: "NABEYAKI UDON",
          quantity: 1,
          type: "noodle",
          status: "Cứng",
        },
        {
          id: 3,
          name: "CURRY UDON",
          quantity: 1,
          type: "noodle",
          status: "Cứng",
        },
      ],
    },
    {
      id: "",
      tableNumber: "",
      location: "",
      dishes: [
        {
          id: 1,
          name: "ISHIKATA SOBA",
          quantity: 1,
          type: "noodle",
          status: "Cứng",
        },
        { id: 2, name: "CHANPON", quantity: 1, type: "noodle", status: "Cứng" },
        {
          id: 3,
          name: "SHOYU RAMEN",
          quantity: 1,
          type: "noodle",
          status: "Cứng",
        },
        {
          id: 4,
          name: "TSUKIMI Y.SOBA",
          quantity: 2,
          type: "noodle",
          status: "Cứng",
        },
        {
          id: 5,
          name: "KIMCHI UDON",
          quantity: 1,
          type: "noodle",
          status: "Cứng",
        },
        {
          id: 6,
          name: "CHIKEN NANBAN",
          quantity: 1,
          type: "noodle",
          status: "Cứng",
        },
      ],
    },
    {
      id: "",
      tableNumber: "",
      location: "",
      dishes: [
        {
          id: 1,
          name: "CHICKEN KATSU",
          quantity: 1,
          type: "main",
          status: "S",
        },
        { id: 2, name: "Trà sữa", quantity: 1, type: "drink", status: "" },
        { id: 3, name: "EBI TEN", quantity: 1, type: "main", status: "" },
        {
          id: 4,
          name: "IKA SATSUMA (R)",
          quantity: 1,
          type: "main",
          status: "",
        },
        { id: 5, name: "KINOKO TEN", quantity: 1, type: "main", status: "" },
        { id: 6, name: "OKONOMI", quantity: 1, type: "main", status: "" },
        {
          id: 7,
          name: "PIRI. GYOZA (R)",
          quantity: 1,
          type: "appetizer",
          status: "",
        },
      ],
    },
  ];

  // Tabs data
  const tabs = [
    { id: "order", label: "Order", count: 26 },
    { id: "theomon", label: "Theo món", count: 26 },
    { id: "phucvu", label: "Phục vụ", count: null },
  ];

  const renderDishItem = (dish) => (
    <View key={dish.id} style={styles.dishItem}>
      <View style={styles.dishRow}>
        <Icon source="bowl-mix" size={20} color="#4a6da7" />
        <Text style={styles.dishName}>{dish.name}</Text>
        <Text style={styles.quantity}>{dish.quantity}</Text>
      </View>
      {dish.status && <Text style={styles.dishStatus}>{dish.status}</Text>}
      {dish.id === 1 && dish.name === "TSUKIMI Y.SOBA" && (
        <View style={styles.cornerBadge}>
          <Text style={styles.cornerBadgeText}>2</Text>
        </View>
      )}
    </View>
  );

  const renderOrderCard = (order, index) => (
    <Surface key={index} style={styles.orderCard}>
      {/* Header */}
      {(order.id || order.tableNumber || order.location) && (
        <View style={[styles.cardHeader, order.isNew && styles.newOrderHeader]}>
          {order.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}
          <Text style={styles.orderId}>
            {order.id} {order.tableNumber}
          </Text>
          <Text style={styles.orderLocation}>{order.location}</Text>
        </View>
      )}

      {/* Dishes */}
      <View style={styles.dishesContainer}>
        {order.dishes.map((dish) => renderDishItem(dish))}
      </View>

      {/* Footer */}
      {order.time && (
        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
            <Text style={styles.orderTime}>{order.time}</Text>
            <View style={styles.receiptInfo}>
              <Icon name="receipt" size={16} color="#333" />
              <Text style={styles.receiptText}>{order.receipt}</Text>
            </View>
          </View>
          <Button
            mode="contained"
            style={styles.payButton}
            labelStyle={styles.payButtonLabel}
          >
            Trả hết
          </Button>
        </View>
      )}
    </Surface>
  );

  return (
    <View style={styles.container}>
      {/* Order Cards - Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.ordersContainer}
      >
        {/* Column 1 */}
        <View style={styles.orderColumn}>
          {renderOrderCard(orders[0], 1)}
          {renderOrderCard(orders[1], 2)}
        </View>

        {/* Column 2 */}
        <View style={styles.orderColumn}>{renderOrderCard(orders[2], 1)}</View>

        {/* Column 3 */}
        <View style={styles.orderColumn}>{renderOrderCard(orders[3], 1)}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    elevation: 2,
  },
  tabsContainer: {
    flex: 1,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
    marginRight: 4,
  },
  tabBadge: {
    backgroundColor: "#FF5252",
  },
  rightActions: {
    flexDirection: "row",
  },
  filterControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    borderRadius: 20,
    borderColor: "#ddd",
  },
  darkModeToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleSwitch: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    marginLeft: 8,
    padding: 2,
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "white",
  },
  ordersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  orderColumn: {
    width: 320,
    marginRight: 12,
  },
  orderCard: {
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
  },
  newOrderHeader: {
    backgroundColor: "#FF5252",
  },
  newBadge: {
    backgroundColor: "white",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: "absolute",
    left: 12,
    top: 12,
  },
  newBadgeText: {
    color: "#FF5252",
    fontWeight: "bold",
    fontSize: 12,
  },
  orderId: {
    fontWeight: "bold",
    color: "white",
  },
  orderLocation: {
    color: "white",
  },
  dishesContainer: {
    backgroundColor: "white",
  },
  dishItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    position: "relative",
  },
  dishRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dishName: {
    flex: 1,
    marginLeft: 8,
    fontWeight: "500",
  },
  quantity: {
    fontWeight: "bold",
    fontSize: 16,
    width: 24,
    textAlign: "right",
  },
  dishStatus: {
    marginLeft: 28,
    color: "#666",
    fontSize: 14,
  },
  cornerBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "45deg" }, { translateX: 12 }, { translateY: 12 }],
  },
  cornerBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    transform: [{ rotate: "-45deg" }],
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  footerInfo: {
    flexDirection: "column",
  },
  orderTime: {
    fontSize: 12,
    color: "#666",
  },
  receiptInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  receiptText: {
    marginLeft: 4,
    fontSize: 12,
  },
  payButton: {
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  payButtonLabel: {
    color: "#333",
    fontSize: 14,
  },
});

export default OrderManagement;
