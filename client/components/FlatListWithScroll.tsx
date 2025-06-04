import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import {
  GestureResponderEvent,
  useWindowDimensions,
  View,
  ScrollView,
} from "react-native";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import { LegendList, LegendListRef } from "@legendapp/list";
import {
  CartItem,
  Dish,
  KitchenDishOrder,
  KitchenLog,
} from "@stores/state.interface";
import KitchenDishOrderByOrderCard from "./ui/kitchen/KitchenDishOrderByOrderCard";
import KitchenDishOrderByDishCard from "./ui/kitchen/KitchenDishOrderByDishCard";
import KitchenDishOrderServingCard from "./ui/kitchen/KitchenDishOrderServingCard";
import { MemoizedDishCard } from "./ui/menus/DishCard";
import { MemoizedDishCardForOrder } from "./ui/menus/DishCardForOrder";
import { MemoizedDishCardForCustomer } from "./ui/menus/DishCardForCustomer";
import KitchenCookedHistoryCard from "./ui/kitchen/KitchenCookedHistoryCard";
import KitchenServedHistoryCard from "./ui/kitchen/KitchenServedHistoryCard";
import {
  UNIVERSAL_MAX_WIDTH_SIDEBAR,
  UNIVERSAL_WIDTH_PIVOT,
} from "@/constants/common";

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
  [ItemTypeFlatList.DISH_CARD]: ({
    key,
    item,
    openMenu,
    containerWidth,
  }: {
    key: string;
    item: Dish;
    openMenu?: (dish: Dish, event: any) => void;
    containerWidth?: number;
  }) => {
    return (
      <MemoizedDishCard
        key={key}
        dish={item}
        openMenu={openMenu}
        containerWidth={containerWidth}
      />
    );
  },

  [ItemTypeFlatList.DISH_CARD_ORDER]: ({
    key,
    item,
    containerWidth,
  }: {
    key: string;
    item: Dish;
    containerWidth?: number;
  }) => {
    return (
      <MemoizedDishCardForOrder
        key={key}
        dish={item}
        containerWidth={containerWidth}
      />
    );
  },

  [ItemTypeFlatList.DISH_CARD_CUSTOMER]: ({
    key,
    item,
    containerWidth,
    additionalDatas,
  }: {
    key: string;
    item: Dish;
    containerWidth?: number;
    additionalDatas: {
      cartItemsGroupByDish: Record<string, CartItem[]>;
    };
  }) => {
    return (
      <MemoizedDishCardForCustomer
        key={key}
        dish={item}
        containerWidth={containerWidth}
        cartItems={additionalDatas.cartItemsGroupByDish[item.id]}
      />
    );
  },

  [ItemTypeFlatList.KITCHEN_DISHORDER_BYORDER]: ({
    key,
    item,
    containerWidth,
  }: {
    key: string;
    item: KitchenDishOrder;
    containerWidth?: number;
  }) => {
    return (
      <KitchenDishOrderByOrderCard
        key={key}
        dishOrder={item}
        containerWidth={containerWidth}
      />
    );
  },

  [ItemTypeFlatList.KITCHEN_DISHORDER_BYDISH]: ({
    key,
    item,
    containerWidth,
  }: {
    key: string;
    item: KitchenDishOrder[];
    containerWidth?: number;
  }) => {
    return (
      <KitchenDishOrderByDishCard
        key={key}
        dishOrders={item}
        containerWidth={containerWidth}
      />
    );
  },

  [ItemTypeFlatList.KITCHEN_DISHORDER_SERVING]: ({
    key,
    item,
    containerWidth,
  }: {
    key: string;
    item: KitchenDishOrder;
    containerWidth?: number;
  }) => {
    return (
      <KitchenDishOrderServingCard
        key={key}
        dishOrder={item}
        containerWidth={containerWidth}
      />
    );
  },

  [ItemTypeFlatList.KITCHEN_COOKED_HISTORY]: ({
    key,
    item,
    containerWidth,
  }: {
    key: string;
    item: KitchenLog;
    containerWidth?: number;
  }) => {
    return (
      <KitchenCookedHistoryCard
        key={key}
        cookedHistory={item}
        containerWidth={containerWidth}
      />
    );
  },

  [ItemTypeFlatList.KITCHEN_SERVED_HISTORY]: ({
    key,
    item,
    containerWidth,
  }: {
    key: string;
    item: KitchenLog;
    containerWidth?: number;
  }) => {
    return (
      <KitchenServedHistoryCard
        key={key}
        servedHistory={item}
        containerWidth={containerWidth}
      />
    );
  },
};

function GroupList({
  groups = [],
  scrollToGroup,
}: {
  groups: any[];
  scrollToGroup: (id: string) => void;
}) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  if (width < UNIVERSAL_WIDTH_PIVOT) {
    return (
      <Surface
        mode="flat"
        style={{
          backgroundColor: theme.colors.background,
          paddingHorizontal: 8,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              paddingVertical: 8,
            }}
          >
            {groups.map((g) => (
              <TouchableRipple
                key={g.id}
                onPress={() => scrollToGroup(g.id)}
                style={{
                  backgroundColor: theme.colors.primaryContainer,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 4,
                }}
              >
                <Text
                  variant="bodyMedium"
                  style={{
                    flexWrap: "wrap",
                    maxWidth: 200,
                  }}
                >
                  {g.name}
                </Text>
              </TouchableRipple>
            ))}
          </View>
        </ScrollView>
      </Surface>
    );
  }

  return (
    <Surface
      mode="flat"
      style={{
        backgroundColor: theme.colors.background,
        width: Math.min(UNIVERSAL_MAX_WIDTH_SIDEBAR, width * 0.15),
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 1 }}>
          {groups.map((g) => {
            return (
              <TouchableRipple
                key={g.id}
                onPress={() => scrollToGroup(g.id)}
                style={{
                  backgroundColor: theme.colors.primaryContainer,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 4,
                }}
              >
                <Text
                  variant="bodyMedium"
                  style={{
                    flexWrap: "wrap",
                  }}
                >
                  {g.name}
                </Text>
              </TouchableRipple>
            );
          })}
        </View>
      </ScrollView>
    </Surface>
  );
}

export interface FlatListItem {
  id: string;
  type: string;
  group: any;
  startIdx?: number;
  items?: any[];
}

const FlatListWithScroll = ({
  groups,
  itemByGroup,
  openMenu,
  itemType,
  additionalDatas,
  shouldShowGroup = true,
  children,
}: {
  groups: any[];
  itemByGroup: Record<string, any[]>;
  openMenu?: (item: any, event: GestureResponderEvent) => void;
  additionalDatas?: any;
  itemType: ItemTypeFlatList;
  shouldShowGroup?: boolean;
  children?: ReactNode;
}) => {
  const { width } = useWindowDimensions();

  const { itemContainerWidth, numColumns } = useMemo(() => {
    let itemContainerWidth;
    if (width < UNIVERSAL_WIDTH_PIVOT) {
      itemContainerWidth = width - 20; // minus padding
    } else {
      itemContainerWidth =
        width -
        (shouldShowGroup
          ? Math.min(width * 0.15, UNIVERSAL_MAX_WIDTH_SIDEBAR)
          : 0);
    }

    const numColumns = Math.floor(
      (itemContainerWidth + 12) /
        Math.min(
          ItemTypeFlatListProperties[itemType].MAX_WIDTH,
          itemContainerWidth * 0.48 + 12,
        ),
    );

    return { itemContainerWidth, numColumns };
  }, [width, itemType, shouldShowGroup]);

  const flatListRef = useRef<LegendListRef | null>(null);
  const { flatListData, indexMap } = useMemo(() => {
    if (numColumns <= 0)
      return {
        flatListData: [],
        indexMap: {},
      };

    const flatListData = groups.flatMap((g) => {
      const items = itemByGroup[g.id] || [];
      const itemRows = [];

      for (let i = 0; i < items.length; i += numColumns) {
        itemRows.push({
          type: "row",
          id: `row-${g.id}-${i}`,
          items: items.slice(i, i + numColumns),
          startIdx: i,
          group: g,
        });
      }

      return [{ type: "header", id: `header-${g.id}`, group: g }, ...itemRows];
    });

    const indexMap: Record<string, number> = {};
    flatListData.forEach((item, index) => {
      if (item.type === "header") {
        indexMap[item.group.id] = index;
      }
    });

    return { flatListData, indexMap };
  }, [groups, itemByGroup, numColumns]);

  const renderItem = useCallback(
    ({ item }: { item: FlatListItem }) => {
      if (item.type === "header") {
        return (
          <Text
            style={{
              marginBottom: 8,
              height: 24,
              fontWeight: "bold",
              fontSize: 20,
            }}
          >
            {item.group.name}
          </Text>
        );
      }

      if (item.type === "row") {
        return (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "nowrap",
              marginBottom: 8,
              gap: 12,
            }}
          >
            {(item.items || []).map((_item: any, idx: number) => {
              return ItemTypeMap[itemType]({
                key: _item.id || idx,
                item: _item,
                openMenu,
                containerWidth: itemContainerWidth,
                additionalDatas,
              });
            })}
            {Array(Math.max(0, numColumns - (item.items || []).length))
              .fill(null)
              .map((_, idx) => (
                <View key={`empty-${idx}`} style={{ flex: 1 }} />
              ))}
          </View>
        );
      }

      return null;
    },
    [itemType, itemContainerWidth, openMenu, additionalDatas, numColumns],
  );

  const scrollToCategory = (categoryId: string) => {
    const index = indexMap[categoryId];
    if (index !== undefined && flatListRef.current) {
      flatListRef.current.scrollToItem({
        item: flatListData[index],
        animated: true,
      });
    }
  };

  const HEADER_HEIGHT = ItemTypeFlatListProperties[itemType].HEADER_HEIGHT;
  const ROW_HEIGHT = ItemTypeFlatListProperties[itemType].ROW_HEIGHT;
  const MARGIN_BOTTOM = 8;
  const getEstimatedItemSize = (index: number, item: FlatListItem) => {
    if (item.type === "header") {
      return HEADER_HEIGHT + MARGIN_BOTTOM;
    } else if (item.type === "row") {
      return ROW_HEIGHT + MARGIN_BOTTOM;
    }
    return 0;
  };

  // force rerender
  useEffect(() => {
    flatListRef.current?.scrollToOffset({
      offset: 0,
    });
  }, []);

  return (
    <Surface
      mode="flat"
      style={{
        flex: 1,
        flexDirection: width >= UNIVERSAL_WIDTH_PIVOT ? "row" : "column",
      }}
    >
      {shouldShowGroup && (
        <GroupList groups={groups} scrollToGroup={scrollToCategory} />
      )}
      <LegendList
        ref={flatListRef}
        data={flatListData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        getEstimatedItemSize={getEstimatedItemSize}
        estimatedItemSize={ROW_HEIGHT + MARGIN_BOTTOM}
        initialContainerPoolRatio={2.0}
        contentContainerStyle={{ flex: 1, padding: 10 }}
        ListFooterComponent={() => children}
      />
    </Surface>
  );
};

export default FlatListWithScroll;
