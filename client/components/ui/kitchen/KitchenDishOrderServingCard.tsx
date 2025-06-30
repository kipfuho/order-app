import React, { memo } from "react";
import { View, Text, ScrollView } from "react-native";
import {
  ActivityIndicator,
  Badge,
  Surface,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { KitchenDishOrder, Shop } from "@stores/state.interface";
import { getMinuteForDisplay, getStatusColor } from "@constants/utils";
import { CustomMD3Theme } from "@constants/theme";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import { useUpdateUnservedDishOrdersRequestMutation } from "@/stores/apiSlices/kitchenApi.slice";
import {
  deleteKitchenDishOrder,
  updateKitchenDishOrder,
} from "@/stores/shop.slice";
import { useTranslation } from "react-i18next";
import { useCurrentTime } from "@/hooks/useCurrentTime";

interface KitchenDishOrderProps {
  dishOrder: KitchenDishOrder;
  containerWidth?: number;
}

const TimeDifferentAndDishQuantity = ({
  dishOrder,
  theme,
}: {
  dishOrder: KitchenDishOrder;
  theme: CustomMD3Theme;
}) => {
  const { t } = useTranslation();
  const now = useCurrentTime();
  const minutesSinceOrderCreated = getMinuteForDisplay({
    now,
    dateTimeString: dishOrder.createdAt,
  });
  const color = getStatusColor(theme, minutesSinceOrderCreated);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: color.view,
        padding: 4,
        paddingHorizontal: 8,
        borderBottomStartRadius: 4,
        borderBottomEndRadius: 4,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <Text style={{ fontSize: 16, color: color.onView }}>
          {minutesSinceOrderCreated}
        </Text>
        <Text style={{ fontSize: 12, marginLeft: 2, color: color.onView }}>
          {t("minute_short")}
        </Text>
      </View>
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
  );
};

const MemoizedTimeDifferentAndDishQuantity = memo(TimeDifferentAndDishQuantity);

const KitchenDishOrderServingCard: React.FC<KitchenDishOrderProps> = ({
  dishOrder,
  containerWidth = 0,
}) => {
  const theme = useTheme<CustomMD3Theme>();
  const dispatch = useDispatch();
  const cardWidth = Math.min(200, containerWidth * 0.48);

  const { currentShop, kitchenDishOrder } = useSelector(
    (state: RootState) => state.shop,
  );
  const shop = currentShop as Shop;

  const [
    updateUncookedDishOrder,
    { isLoading: updateUnservedDishOrderLoading },
  ] = useUpdateUnservedDishOrdersRequestMutation();

  const handleOnPress = async () => {
    if (!kitchenDishOrder[dishOrder.id]?.confirmed) {
      dispatch(
        updateKitchenDishOrder({
          dishOrderId: dishOrder.id,
          confirmed: true,
        }),
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

  const handleOnLongPress = () => {
    dispatch(
      updateKitchenDishOrder({ dishOrderId: dishOrder.id, confirmed: false }),
    );
  };

  if (cardWidth < 1) {
    return;
  }

  return (
    <TouchableRipple onPress={handleOnPress} onLongPress={handleOnLongPress}>
      <Surface
        style={{
          borderRadius: 4,
          width: cardWidth,
          height: cardWidth,
          elevation: 3,
          backgroundColor: kitchenDishOrder[dishOrder.id]?.confirmed
            ? theme.colors.primaryContainer
            : theme.colors.background,
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
              {dishOrder.orderNo}-{dishOrder.dishOrderNo}
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

          {updateUnservedDishOrderLoading ? (
            <ActivityIndicator />
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <Text style={{ fontSize: 18, color: theme.colors.onBackground }}>
                {dishOrder.name}
              </Text>
            </ScrollView>
          )}
        </View>

        <View>
          <Text
            style={{
              fontSize: 14,
              alignSelf: "flex-end",
              color: theme.colors.outline,
            }}
          >
            {dishOrder.createdAt}
          </Text>
          <MemoizedTimeDifferentAndDishQuantity
            dishOrder={dishOrder}
            theme={theme}
          />
        </View>
      </Surface>
    </TouchableRipple>
  );
};

export default memo(KitchenDishOrderServingCard);
