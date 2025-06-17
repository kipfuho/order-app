import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  ActivityIndicator,
  Button,
  Surface,
  useTheme,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { LegendList } from "@legendapp/list";
import { KitchenDishOrder, Shop } from "@stores/state.interface";
import { getMinuteForDisplay, getStatusColor } from "@constants/utils";
import { CustomMD3Theme } from "@constants/theme";
import { useUpdateUncookedDishOrdersRequestMutation } from "@stores/apiSlices/kitchenApi.slice";
import { RootState } from "@stores/store";
import {
  deleteKitchenDishOrder,
  updateKitchenDishOrder,
} from "@stores/shop.slice";
import { useCurrentTime } from "@/hooks/useCurrentTime";

const TableKitchenDishOrderTime = ({
  item,
  theme,
}: {
  item: KitchenDishOrder;
  theme: CustomMD3Theme;
}) => {
  const { t } = useTranslation();
  const now = useCurrentTime();
  const minutesSinceOrderCreated = getMinuteForDisplay({
    now,
    dateTimeString: item.createdAt,
  });
  const color = getStatusColor(theme, minutesSinceOrderCreated);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 16 }}>x{item.quantity}</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          backgroundColor: color.view,
          padding: 1,
          paddingHorizontal: 4,
          borderRadius: 4,
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
          {t("minute_short")}
        </Text>
      </View>
    </View>
  );
};

const MemoizedTableKitchenDishOrderTime = memo(TableKitchenDishOrderTime);

const TableKitchenDishOrder = ({
  item,
  handleOnPress,
  handleOnLongPress,
}: {
  item: KitchenDishOrder;
  handleOnPress: (item: KitchenDishOrder, confirmed: boolean) => void;
  handleOnLongPress: (item: KitchenDishOrder) => void;
}) => {
  const theme = useTheme<CustomMD3Theme>();
  const { kitchenDishOrder } = useSelector((state: RootState) => state.shop);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => handleOnPress(item, kitchenDishOrder[item.id]?.confirmed)}
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
        <MemoizedTableKitchenDishOrderTime item={item} theme={theme} />
      </Surface>
    </TouchableOpacity>
  );
};

const MemoizedTableKitchenDishOrder = memo(TableKitchenDishOrder);

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

  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const [
    updateUncookedDishOrder,
    { isLoading: updateUncookedDishOrderLoading },
  ] = useUpdateUncookedDishOrdersRequestMutation();

  const handleOnPress = async (
    dishOrder: KitchenDishOrder,
    confirmed: boolean,
  ) => {
    if (!confirmed) {
      dispatch(
        updateKitchenDishOrder({ dishOrderId: dishOrder.id, confirmed: true }),
      );
      return;
    }

    if (updateUncookedDishOrderLoading) {
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
      updateKitchenDishOrder({ dishOrderId: dishOrder.id, confirmed: false }),
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
        <LegendList
          data={dishOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MemoizedTableKitchenDishOrder
              item={item}
              handleOnPress={handleOnPress}
              handleOnLongPress={handleOnLongPress}
            />
          )}
        />
      </View>

      <View style={{ padding: 8 }}>
        {updateUncookedDishOrderLoading ? (
          <ActivityIndicator />
        ) : (
          <Button
            mode="contained"
            style={{ width: "30%", minWidth: 150, alignSelf: "flex-end" }}
            onPress={onServeAll}
          >
            {t("serve_all")}
          </Button>
        )}
      </View>
    </Surface>
  );
}
