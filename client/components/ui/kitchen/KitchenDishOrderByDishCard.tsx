import _ from "lodash";
import React, { memo, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import {
  Badge,
  Modal,
  Portal,
  Surface,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
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
  const minutesSinceOrderCreated = getMinuteForDisplay({
    now,
    dateTimeString: dishOrders[0].createdAt,
  });
  const color = getStatusColor(theme, minutesSinceOrderCreated);

  return (
    <View
      style={[
        styles.footerContainer,
        {
          backgroundColor: color.view,
        },
      ]}
    >
      <View style={styles.timeTextContainer}>
        <Text style={[styles.timeText, { color: color.onView }]}>
          {minutesSinceOrderCreated}
        </Text>
        <Text style={[styles.minuteShortText, { color: color.onView }]}>
          {t("minute_short")}
        </Text>
      </View>
      <Text style={[styles.quantityText, { color: color.onView }]}>
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

  if (cardWidth < 1) return null;

  return (
    <>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <KitchenDishOrderGroup
            dishOrders={dishOrders}
            onServeAll={onServeAll}
          />
        </Modal>
      </Portal>
      <Surface
        style={[
          styles.cardOuter,
          {
            width: cardWidth,
            height: cardWidth,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <TouchableRipple
          onPress={() => setModalVisible(true)}
          style={styles.flex}
        >
          <View style={styles.cardInner}>
            <View style={styles.cardContent}>
              <View style={styles.header}>
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
                  {dishOrders[0].name}
                </Text>
              </ScrollView>
            </View>

            <View>
              <Text
                style={[styles.createdAtText, { color: theme.colors.outline }]}
              >
                {dishOrders[0].createdAt}
              </Text>
              <MemoizedTimeDifferentAndDishQuantity
                dishOrders={dishOrders}
                theme={theme}
              />
            </View>
          </View>
        </TouchableRipple>
      </Surface>
    </>
  );
};

export default memo(KitchenDishOrderByDishCard);

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
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 6,
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
  modalContainer: {
    borderRadius: 4,
    alignSelf: "center",
    height: "80%",
    maxHeight: 500,
    maxWidth: 700,
  },
});
