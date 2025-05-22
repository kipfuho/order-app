import {
  FlatList,
  GestureResponderEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import {
  createElement,
  memo,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { ScrollView } from "react-native";
import { CartItem, Dish, KitchenDishOrder } from "../stores/state.interface";
import KitchenDishOrderByOrderCard from "./ui/kitchen/KitchenDishOrderByOrderCard";
import KitchenDishOrderByDishCard from "./ui/kitchen/KitchenDishOrderByDishCard";
import KitchenDishOrderServingCard from "./ui/kitchen/KitchenDishOrderServingCard";
import { MemoizedDishCard } from "./ui/menus/DishCard";
import { MemoizedDishCardForOrder } from "./ui/menus/DishCardForOrder";
import { MemoizedDishCardForCustomer } from "./ui/menus/DishCardForCustomer";

export const UNIVERSAL_WIDTH_PIVOT = 600;

export enum ItemTypeFlatList {
  DISH_CARD = "dishCard",
  DISH_CARD_ORDER = "dishCardOrder",
  DISH_CARD_CUSTOMER = "dishCardCustomer",
  KITCHEN_DISHORDER_BYORDER = "kitchenDishOrderByOrder",
  KITCHEN_DISHORDER_BYDISH = "kitchenDishOrderByDish",
  KITCHEN_DISHORDER_SERVING = "kitchenDishOrderServing",
}

// GAP = 12
export const ItemTypeFlatListProperties = {
  [ItemTypeFlatList.DISH_CARD]: {
    MAX_WIDTH: 300 + 12,
    HEADER_HEIGHT: 24,
    ROW_HEIGHT: 288,
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
    if (!openMenu) return;

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
    return createElement(KitchenDishOrderByOrderCard, {
      key,
      dishOrder: item,
      containerWidth,
    });
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
    return createElement(KitchenDishOrderByDishCard, {
      key,
      dishOrders: item,
      containerWidth,
    });
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
    return createElement(KitchenDishOrderServingCard, {
      key,
      dishOrder: item,
      containerWidth,
    });
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
              flexDirection: "row", // layout items in a row
              gap: 8, // spacing between items (RN 0.71+ supports `gap`)
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
      style={[
        flatListStyles.sidebar,
        { backgroundColor: theme.colors.background },
      ]}
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
  openMenu: (item: any, event: GestureResponderEvent) => void;
  additionalDatas?: any;
  itemType: ItemTypeFlatList;
  shouldShowGroup?: boolean;
  children?: ReactNode;
}) => {
  const { width } = useWindowDimensions();
  const [itemContainerWidth, setItemContainerWidth] = useState<number>(1);
  const [numColumns, setNumColumns] = useState<number>(0);

  const flatListRef = useRef<FlatList<any>>(null);
  const flatListData = useMemo(() => {
    if (numColumns <= 0) return [];

    return groups.flatMap((g) => {
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
  }, [groups, itemByGroup, numColumns]);

  const indexMap = useMemo(() => {
    const map: Record<string, number> = {};
    flatListData.forEach((item, index) => {
      if (item.type === "header") {
        map[item.group.id] = index;
      }
    });
    return map;
  }, [flatListData]);

  const renderItem = useCallback(
    ({ item }: { item: FlatListItem }) => {
      if (item.type === "header") {
        return (
          <Text style={flatListStyles.categoryTitle}>{item.group.name}</Text>
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
    [itemType, itemContainerWidth, openMenu, additionalDatas, numColumns]
  );

  const scrollToCategory = (categoryId: string) => {
    const index = indexMap[categoryId];
    if (index !== undefined && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const getItemLayout = (
    _: ArrayLike<FlatListItem> | null | undefined,
    index: number
  ) => {
    // Alternate between headers and rows
    const HEADER_HEIGHT = ItemTypeFlatListProperties[itemType].HEADER_HEIGHT;
    const ROW_HEIGHT = ItemTypeFlatListProperties[itemType].ROW_HEIGHT;
    const MARGIN_BOTTOM = 8;

    // You must be able to calculate item height based on index or item type
    const offset = flatListData
      .slice(0, index)
      .reduce(
        (sum, item) =>
          sum +
          (item.type === "header" ? HEADER_HEIGHT : ROW_HEIGHT) +
          MARGIN_BOTTOM,
        0
      );

    const length =
      flatListData[index].type === "header" ? HEADER_HEIGHT : ROW_HEIGHT;

    return { length, offset, index };
  };

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
      <FlatList
        ref={flatListRef}
        data={flatListData}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        keyExtractor={(item) => item.id}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 100);
        }}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          const containerUsablewidth = width - 20; // padding
          setItemContainerWidth(containerUsablewidth);
          setNumColumns(
            Math.floor(
              (containerUsablewidth + 12) /
                Math.min(
                  ItemTypeFlatListProperties[itemType].MAX_WIDTH,
                  containerUsablewidth * 0.48 + 12
                )
            )
          );
        }}
        contentContainerStyle={{ padding: 10 }}
        ListFooterComponent={() => children}
      />
    </Surface>
  );
};

export const flatListStyles = StyleSheet.create({
  sidebar: {
    width: 120,
  },
  categoryTitle: {
    marginBottom: 8,
    height: 24,
    fontWeight: "bold",
    fontSize: 20,
  },
});

export default FlatListWithScroll;
