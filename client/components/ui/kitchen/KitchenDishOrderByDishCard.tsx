import React, { memo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Badge, Modal, Portal, Surface, useTheme } from "react-native-paper";
import { KitchenDishOrder } from "../../../stores/state.interface";
import { getMinuteForDisplay, getStatusColor } from "../../../constants/utils";
import { CustomMD3Theme } from "../../../constants/theme";
import _ from "lodash";
import { useUpdateUncookedDishOrdersRequestMutation } from "../../../stores/apiSlices/kitchenApi.slice";
import KitchenDishOrderGroup from "./KitchenDishOrderGroupModal";

interface KitchenDishOrderProps {
  dishOrders: KitchenDishOrder[];
  containerWidth?: number;
}

const TimeDifferentAndDishQuantity = memo(
  ({
    dishOrders,
    theme,
  }: {
    dishOrders: KitchenDishOrder[];
    theme: CustomMD3Theme;
  }) => {
    const minutesSinceOrderCreated = getMinuteForDisplay(
      Date.now() - new Date(dishOrders[0].createdAt).getTime()
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
            m
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
  }
);

const KitchenDishOrderByDishCard: React.FC<KitchenDishOrderProps> = memo(
  ({ dishOrders, containerWidth = 0 }) => {
    const theme = useTheme<CustomMD3Theme>();
    const cardWidth = Math.min(200, containerWidth * 0.48);
    const [modalVisible, setModalVisible] = useState(false);

    const [
      updateUncookedDishOrder,
      { isLoading: updateUncookedDishOrderLoading },
    ] = useUpdateUncookedDishOrdersRequestMutation();

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
              boxShadow: "none",
            }}
          >
            <KitchenDishOrderGroup
              dishOrders={dishOrders}
              onServeAll={() => {}}
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

              <View style={{ flex: 1, overflow: "scroll" }}>
                <Text
                  style={{ fontSize: 18, color: theme.colors.onBackground }}
                >
                  {dishOrders[0].name}
                </Text>
              </View>
            </View>

            <TimeDifferentAndDishQuantity
              dishOrders={dishOrders}
              theme={theme}
            />
          </Surface>
        </TouchableOpacity>
      </>
    );
  }
);

export default KitchenDishOrderByDishCard;
