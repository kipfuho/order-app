import React from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Button, Surface, useTheme } from "react-native-paper";
import { KitchenDishOrder, Shop } from "../../../stores/state.interface";
import { getMinuteForDisplay, getStatusColor } from "../../../constants/utils";
import { CustomMD3Theme } from "../../../constants/theme";
import { useTranslation } from "react-i18next";
import { useUpdateUncookedDishOrdersRequestMutation } from "../../../stores/apiSlices/kitchenApi.slice";
import { RootState } from "../../../stores/store";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteKitchenDishOrder,
  updateKitchenDishOrder,
} from "../../../stores/shop.slice";

export default function KitchenDishOrderGroup({
  dishOrders,
  onServeAll,
}: {
  dishOrders: KitchenDishOrder[];
  onServeAll: () => void;
}) {
  const theme = useTheme<CustomMD3Theme>();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { currentShop, kitchenDishOrder } = useSelector(
    (shop: RootState) => shop.shop
  );
  const shop = currentShop as Shop;

  const [
    updateUncookedDishOrder,
    { isLoading: updateUncookedDishOrderLoading },
  ] = useUpdateUncookedDishOrdersRequestMutation();

  const handleOnPress = async (dishOrder: KitchenDishOrder) => {
    if (!kitchenDishOrder[dishOrder.id]?.confirmed) {
      dispatch(
        updateKitchenDishOrder({ dishOrderId: dishOrder.id, confirmed: true })
      );
      return;
    }

    const updateSuccess = await updateUncookedDishOrder({
      shopId: shop.id,
      updateRequests: [
        {
          dishOrderId: dishOrder.id,
          orderId: dishOrder.orderId,
        },
      ],
    }).unwrap();

    if (updateSuccess) {
      dispatch(deleteKitchenDishOrder({ dishOrderId: dishOrder.id }));
    }
  };

  const handleOnLongPress = (dishOrder: KitchenDishOrder) => {
    dispatch(
      updateKitchenDishOrder({ dishOrderId: dishOrder.id, confirmed: false })
    );
  };

  return (
    <Surface mode="flat" style={{ height: "100%" }}>
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
            renderItem={({ item }) => {
              const minutesSinceOrderCreated = getMinuteForDisplay(
                Date.now() - new Date(item.createdAt).getTime()
              );
              const color = getStatusColor(theme, minutesSinceOrderCreated);

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleOnPress(item)}
                  onLongPress={() => handleOnLongPress(item)}
                >
                  <Surface
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 8,
                      paddingHorizontal: 16,
                      marginHorizontal: 12,
                      marginTop: 10,
                      borderRadius: 8,
                      backgroundColor: kitchenDishOrder[item.id]?.confirmed
                        ? theme.colors.primaryContainer
                        : theme.colors.background,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{item.tableName}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{item.quantity}</Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-end",
                          backgroundColor: color.view,
                          padding: 1,
                          paddingHorizontal: 4,
                        }}
                      >
                        <Text style={{ fontSize: 16, color: color.onView }}>
                          {minutesSinceOrderCreated}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            marginLeft: 2,
                            color: color.onView,
                          }}
                        >
                          m
                        </Text>
                      </View>
                    </View>
                  </Surface>
                </TouchableOpacity>
              );
            }}
          />
        </ScrollView>
      </View>

      <View style={{ padding: 8 }}>
        <Button
          mode="contained"
          style={{ width: "30%", minWidth: 150, alignSelf: "flex-end" }}
          onPress={onServeAll}
        >
          {t("serve_all")}
        </Button>
      </View>
    </Surface>
  );
}
