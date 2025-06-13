import _ from "lodash";
import React, { memo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Badge, Modal, Portal, Surface, useTheme } from "react-native-paper";
import { KitchenDishOrder, Shop } from "@stores/state.interface";
import { getMinuteForDisplay, getStatusColor } from "@constants/utils";
import { CustomMD3Theme } from "@constants/theme";
import KitchenDishOrderGroup from "./KitchenDishOrderGroupModal";
import { RootState } from "@/stores/store";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteKitchenDishOrder,
  updateKitchenDishOrder,
} from "@/stores/shop.slice";
import { useUpdateUncookedDishOrdersRequestMutation } from "@/stores/apiSlices/kitchenApi.slice";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useTranslation } from "react-i18next";

interface KitchenDishOrderProps {
  dishOrders: KitchenDishOrder[];
  containerWidth?: number;
}

const TimeDifferentAndDishQuantity = ({
  dishOrders,
  theme,
}: {
  dishOrders: KitchenDishOrder[];
  theme: CustomMD3Theme;
}) => {
  const { t } = useTranslation();
  const now = useCurrentTime();
  const minutesSinceOrderCreated = getMinuteForDisplay(
    now - new Date(dishOrders[0].createdAt).getTime(),
  );
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
        x {_.sumBy(dishOrders, "quantity")}
      </Text>
    </View>
  );
};

const MemoizedTimeDifferentAndDishQuantity = memo(TimeDifferentAndDishQuantity);

const KitchenDishOrderByDishCard: React.FC<KitchenDishOrderProps> = ({
  dishOrders,
  containerWidth = 0,
}) => {
  const theme = useTheme<CustomMD3Theme>();
  const dispatch = useDispatch();
  const cardWidth = Math.min(200, containerWidth * 0.48);
  const [modalVisible, setModalVisible] = useState(false);

  const { currentShop, kitchenDishOrder } = useSelector(
    (state: RootState) => state.shop,
  );
  const shop = currentShop as Shop;
  const [updateUncookedDishOrder] =
    useUpdateUncookedDishOrdersRequestMutation();

  const onServeAll = async () => {
    const notAllConfirmed = dishOrders.reduce((prev, dishOrder) => {
      if (!kitchenDishOrder[dishOrder.id]?.confirmed) {
        dispatch(
          updateKitchenDishOrder({
            dishOrderId: dishOrder.id,
            confirmed: true,
          }),
        );
        return true;
      }
      return prev;
    }, false);

    if (notAllConfirmed) return;
    const updateSuccess = await updateUncookedDishOrder({
      shopId: shop.id,
      updateRequests: dishOrders.map((dishOrder) => ({
        dishOrderId: dishOrder.id,
        orderId: dishOrder.orderId,
      })),
    }).unwrap();

    if (updateSuccess) {
      dishOrders.forEach((dishOrder) => {
        dispatch(deleteKitchenDishOrder({ dishOrderId: dishOrder.id }));
      });
    }
  };

  if (cardWidth < 1) {
    return;
  }

  return (
    <>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            borderRadius: 4,
            alignSelf: "center",
            width: "60%",
            height: "80%",
            boxShadow: "none",
          }}
        >
          <KitchenDishOrderGroup
            dishOrders={dishOrders}
            onServeAll={onServeAll}
          />
        </Modal>
      </Portal>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
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
                justifyContent: "flex-end",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Badge
                style={{
                  backgroundColor: theme.colors.tertiaryContainer,
                  color: theme.colors.onTertiaryContainer,
                  fontSize: 14,
                  paddingHorizontal: 8,
                  alignSelf: "center",
                }}
              >
                {dishOrders.length || 0}
              </Badge>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <Text style={{ fontSize: 18, color: theme.colors.onBackground }}>
                {dishOrders[0].name}
              </Text>
            </ScrollView>
          </View>

          <View>
            <Text
              style={{
                fontSize: 14,
                alignSelf: "flex-end",
                color: theme.colors.outline,
              }}
            >
              {dishOrders[0].createdAt}
            </Text>
            <MemoizedTimeDifferentAndDishQuantity
              dishOrders={dishOrders}
              theme={theme}
            />
          </View>
        </Surface>
      </TouchableOpacity>
    </>
  );
};

export default memo(KitchenDishOrderByDishCard);
