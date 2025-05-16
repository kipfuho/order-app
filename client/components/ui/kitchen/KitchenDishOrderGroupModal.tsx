import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Button, Surface, useTheme } from "react-native-paper";
import { KitchenDishOrder } from "../../../stores/state.interface";

export default function KitchenDishOrderGroup({
  dishOrders,
  onServeAll,
}: {
  dishOrders: KitchenDishOrder[];
  onServeAll: () => void;
}) {
  const theme = useTheme();

  return (
    <Surface mode="flat">
      <View
        style={{
          backgroundColor: theme.colors.primary,
          padding: 12,
        }}
      >
        <Text
          style={{
            color: theme.colors.onPrimary,
            fontWeight: "bold",
            fontSize: 16,
            textAlign: "center",
          }}
          numberOfLines={3}
        >
          ({dishOrders.length}) {dishOrders[0].name}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView>
          <FlatList
            data={dishOrders}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 10,
                  marginHorizontal: 12,
                  marginTop: 10,
                  borderRadius: 8,
                  borderWidth: 0.5,
                  borderColor: "#ccc",
                  backgroundColor: "white",
                }}
              >
                <Text style={{ fontSize: 16 }}>{item.tableName}</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text style={{ fontSize: 16, marginRight: 6 }}>
                    {item.quantity}
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#ff3b4f",
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 12,
                      }}
                    >
                      {item.createdAt}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        </ScrollView>
      </View>

      <View style={{ padding: 8 }}>
        <Button
          mode="contained"
          style={{ width: "30%", minWidth: 150, alignSelf: "flex-end" }}
          onPress={onServeAll}
        >
          Trả hết
        </Button>
      </View>
    </Surface>
  );
}
