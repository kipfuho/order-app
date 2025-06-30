import React, { memo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
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
    <View style={[styles.footerContainer, { backgroundColor: color.view }]}>
      <View style={styles.timeTextContainer}>
        <Text style={[styles.timeText, { color: color.onView }]}>
          {minutesSinceOrderCreated}
        </Text>
        <Text style={[styles.minuteShortText, { color: color.onView }]}>
          {t("minute_short")}
        </Text>
      </View>
      <Text style={[styles.quantityText, { color: color.onView }]}>
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

  if (cardWidth < 1) return null;

  return (
    <Surface
      style={[
        styles.cardOuter,
        {
          width: cardWidth,
          height: cardWidth,
          backgroundColor: kitchenDishOrder[dishOrder.id]?.confirmed
            ? theme.colors.primaryContainer
            : theme.colors.background,
        },
      ]}
    >
      <TouchableRipple
        onPress={handleOnPress}
        onLongPress={handleOnLongPress}
        style={styles.flex}
      >
        <View style={styles.cardInner}>
          <View style={styles.cardContent}>
            <View style={styles.header}>
              <Text
                style={[
                  styles.orderNoText,
                  { color: theme.colors.onBackground },
                ]}
              >
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
                style={styles.flex}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                <Text
                  style={[
                    styles.dishName,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  {dishOrder.name}
                </Text>
              </ScrollView>
            )}
          </View>

          <View>
            <Text
              style={[styles.createdAtText, { color: theme.colors.outline }]}
            >
              {dishOrder.createdAt}
            </Text>
            <MemoizedTimeDifferentAndDishQuantity
              dishOrder={dishOrder}
              theme={theme}
            />
          </View>
        </View>
      </TouchableRipple>
    </Surface>
  );
};

export default memo(KitchenDishOrderServingCard);

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 4,
    elevation: 3,
  },
  cardInner: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardContent: {
    flex: 1,
    padding: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  orderNoText: {
    fontSize: 24,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  dishName: {
    fontSize: 18,
  },
  createdAtText: {
    fontSize: 14,
    alignSelf: "flex-end",
    paddingHorizontal: 4,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 4,
    paddingHorizontal: 8,
    borderBottomStartRadius: 4,
    borderBottomEndRadius: 4,
  },
  timeTextContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  timeText: {
    fontSize: 16,
  },
  minuteShortText: {
    fontSize: 12,
    marginLeft: 2,
  },
  quantityText: {
    fontSize: 20,
  },
});
