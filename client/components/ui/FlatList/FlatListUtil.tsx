import { memo } from "react";
import { Dish, KitchenDishOrder, KitchenLog } from "@stores/state.interface";
import KitchenDishOrderByOrderCard from "../kitchen/KitchenDishOrderByOrderCard";
import KitchenDishOrderByDishCard from "../kitchen/KitchenDishOrderByDishCard";
import KitchenDishOrderServingCard from "../kitchen/KitchenDishOrderServingCard";
import { MemoizedDishCard } from "../menus/DishCard";
import { MemoizedDishCardForOrder } from "../menus/DishCardForOrder";
import { MemoizedDishCardForCustomer } from "../menus/DishCardForCustomer";
import KitchenCookedHistoryCard from "../kitchen/KitchenCookedHistoryCard";
import KitchenServedHistoryCard from "../kitchen/KitchenServedHistoryCard";
import { View, GestureResponderEvent } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export enum ItemTypeFlatList {
  DISH_CARD = "dishCard",
  DISH_CARD_ORDER = "dishCardOrder",
  DISH_CARD_CUSTOMER = "dishCardCustomer",
  KITCHEN_DISHORDER_BYORDER = "kitchenDishOrderByOrder",
  KITCHEN_DISHORDER_BYDISH = "kitchenDishOrderByDish",
  KITCHEN_DISHORDER_SERVING = "kitchenDishOrderServing",
  KITCHEN_COOKED_HISTORY = "kitchenCookedHistory",
  KITCHEN_SERVED_HISTORY = "kitchenServedHistory",
}

// GAP = 12
export const ItemTypeFlatListLoadingHeight = 80;
export const ItemTypeFlatListMarginBottom = 8;
export const ItemTypeFlatListProperties = {
  [ItemTypeFlatList.DISH_CARD]: {
    MAX_WIDTH: 300 + 12,
    HEADER_HEIGHT: 24,
    ROW_HEIGHT: 300,
  },
  [ItemTypeFlatList.DISH_CARD_ORDER]: {
    MAX_WIDTH: 200 + 12,
    HEADER_HEIGHT: 24,
    ROW_HEIGHT: 250,
  },
  [ItemTypeFlatList.DISH_CARD_CUSTOMER]: {
    MAX_WIDTH: 200 + 12,
    HEADER_HEIGHT: 24,
    ROW_HEIGHT: 294,
  },
  [ItemTypeFlatList.KITCHEN_DISHORDER_BYORDER]: {
    MAX_WIDTH: 200 + 12,
    HEADER_HEIGHT: 24,
    ROW_HEIGHT: 200,
  },
  [ItemTypeFlatList.KITCHEN_DISHORDER_BYDISH]: {
    MAX_WIDTH: 200 + 12,
    HEADER_HEIGHT: 24,
    ROW_HEIGHT: 200,
  },
  [ItemTypeFlatList.KITCHEN_DISHORDER_SERVING]: {
    MAX_WIDTH: 200 + 12,
    HEADER_HEIGHT: 24,
    ROW_HEIGHT: 200,
  },
  [ItemTypeFlatList.KITCHEN_COOKED_HISTORY]: {
    MAX_WIDTH: 200 + 12,
    HEADER_HEIGHT: 24,
    ROW_HEIGHT: 125,
  },
  [ItemTypeFlatList.KITCHEN_SERVED_HISTORY]: {
    MAX_WIDTH: 200 + 12,
    HEADER_HEIGHT: 24,
    ROW_HEIGHT: 125,
  },
};

export const ItemTypeMap = {
  [ItemTypeFlatList.DISH_CARD]: memo(function DishCard({
    item,
    openMenu,
    containerWidth,
  }: {
    item: Dish;
    openMenu?: (dish: Dish, event: any) => void;
    containerWidth?: number;
  }) {
    return (
      <MemoizedDishCard
        dish={item}
        openMenu={openMenu}
        containerWidth={containerWidth}
      />
    );
  }),

  [ItemTypeFlatList.DISH_CARD_ORDER]: memo(function DishCardOrder({
    item,
    containerWidth,
  }: {
    item: Dish;
    containerWidth?: number;
  }) {
    return (
      <MemoizedDishCardForOrder dish={item} containerWidth={containerWidth} />
    );
  }),

  [ItemTypeFlatList.DISH_CARD_CUSTOMER]: memo(function DishCardCustomer({
    item,
    containerWidth,
    openMenu,
  }: {
    item: Dish;
    containerWidth?: number;
    openMenu?: (dish: Dish, event: any) => void;
  }) {
    return (
      <MemoizedDishCardForCustomer
        dish={item}
        containerWidth={containerWidth}
        openMenu={openMenu}
      />
    );
  }),

  [ItemTypeFlatList.KITCHEN_DISHORDER_BYORDER]: memo(
    function KitchenDishOrderByOrder({
      item,
      containerWidth,
    }: {
      item: KitchenDishOrder;
      containerWidth?: number;
    }) {
      return (
        <KitchenDishOrderByOrderCard
          dishOrder={item}
          containerWidth={containerWidth}
        />
      );
    },
  ),

  [ItemTypeFlatList.KITCHEN_DISHORDER_BYDISH]: memo(
    function KitchenDishOrderByDish({
      item,
      containerWidth,
    }: {
      item: KitchenDishOrder[];
      containerWidth?: number;
    }) {
      return (
        <KitchenDishOrderByDishCard
          dishOrders={item}
          containerWidth={containerWidth}
        />
      );
    },
  ),

  [ItemTypeFlatList.KITCHEN_DISHORDER_SERVING]: memo(
    function KitchenDishOrderServing({
      item,
      containerWidth,
    }: {
      item: KitchenDishOrder;
      containerWidth?: number;
    }) {
      return (
        <KitchenDishOrderServingCard
          dishOrder={item}
          containerWidth={containerWidth}
        />
      );
    },
  ),

  [ItemTypeFlatList.KITCHEN_COOKED_HISTORY]: memo(
    function KitchenCookedHistory({
      item,
      containerWidth,
    }: {
      item: KitchenLog;
      containerWidth?: number;
    }) {
      return (
        <KitchenCookedHistoryCard
          cookedHistory={item}
          containerWidth={containerWidth}
        />
      );
    },
  ),

  [ItemTypeFlatList.KITCHEN_SERVED_HISTORY]: memo(
    function KitchenServedHistory({
      item,
      containerWidth,
    }: {
      item: KitchenLog;
      containerWidth?: number;
    }) {
      return (
        <KitchenServedHistoryCard
          servedHistory={item}
          containerWidth={containerWidth}
        />
      );
    },
  ),
};

export interface FlatListItem {
  id: string;
  type: "header" | "row" | "loading";
  group: any;
  startIdx?: number;
  items?: any[];
}

// Memoized EmptyCell component
export const FlatListEmptyCell = memo(function EmptyCell() {
  return <View style={{ flex: 1 }} />;
});

// Memoized HeaderItem component
export const FlatListHeaderItem = memo(function HeaderItem({
  group,
}: {
  group: any;
}) {
  return (
    <Text
      style={{
        marginBottom: 8,
        height: 24,
        fontWeight: "bold",
        fontSize: 20,
      }}
    >
      {group.name}
    </Text>
  );
});

// Memoized Loading component
export const FlatListLoadingItem = memo(function LoadingItem() {
  return (
    <View
      style={{
        height: 80,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
});

// Memoized Row component
export const FlatListRowItem = memo(function RowItem({
  items,
  numColumns,
  itemType,
  openMenu,
  itemContainerWidth,
}: {
  items: any[];
  numColumns: number;
  itemType: ItemTypeFlatList;
  openMenu?: (item: any, event: GestureResponderEvent) => void;
  itemContainerWidth: number;
}) {
  const ComponentType = ItemTypeMap[itemType];

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "nowrap",
        marginBottom: 8,
        gap: 12,
      }}
    >
      {items.map((_item: any, idx: number) => {
        return (
          <ComponentType
            key={_item.id || idx}
            item={_item}
            openMenu={openMenu}
            containerWidth={itemContainerWidth}
          />
        );
      })}
      {Array(Math.max(0, numColumns - items.length))
        .fill(null)
        .map((_, idx) => (
          <FlatListEmptyCell key={idx} />
        ))}
    </View>
  );
});
