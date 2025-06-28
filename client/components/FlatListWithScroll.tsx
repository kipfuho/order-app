import { ReactNode, useCallback, useMemo, useRef, memo } from "react";
import {
  GestureResponderEvent,
  useWindowDimensions,
  View,
  ScrollView,
} from "react-native";
import {
  ActivityIndicator,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import { Dish, KitchenDishOrder, KitchenLog } from "@stores/state.interface";
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
  // eslint-disable-next-line react/display-name
  [ItemTypeFlatList.DISH_CARD]: memo(
    ({
      item,
      openMenu,
      containerWidth,
    }: {
      item: Dish;
      openMenu?: (dish: Dish, event: any) => void;
      containerWidth?: number;
    }) => (
      <MemoizedDishCard
        dish={item}
        openMenu={openMenu}
        containerWidth={containerWidth}
      />
    ),
  ),

  // eslint-disable-next-line react/display-name
  [ItemTypeFlatList.DISH_CARD_ORDER]: memo(
    ({ item, containerWidth }: { item: Dish; containerWidth?: number }) => (
      <MemoizedDishCardForOrder dish={item} containerWidth={containerWidth} />
    ),
  ),

  // eslint-disable-next-line react/display-name
  [ItemTypeFlatList.DISH_CARD_CUSTOMER]: memo(
    ({ item, containerWidth }: { item: Dish; containerWidth?: number }) => (
      <MemoizedDishCardForCustomer
        dish={item}
        containerWidth={containerWidth}
      />
    ),
  ),

  // eslint-disable-next-line react/display-name
  [ItemTypeFlatList.KITCHEN_DISHORDER_BYORDER]: memo(
    ({
      item,
      containerWidth,
    }: {
      item: KitchenDishOrder;
      containerWidth?: number;
    }) => (
      <KitchenDishOrderByOrderCard
        dishOrder={item}
        containerWidth={containerWidth}
      />
    ),
  ),

  // eslint-disable-next-line react/display-name
  [ItemTypeFlatList.KITCHEN_DISHORDER_BYDISH]: memo(
    ({
      item,
      containerWidth,
    }: {
      item: KitchenDishOrder[];
      containerWidth?: number;
    }) => (
      <KitchenDishOrderByDishCard
        dishOrders={item}
        containerWidth={containerWidth}
      />
    ),
  ),

  // eslint-disable-next-line react/display-name
  [ItemTypeFlatList.KITCHEN_DISHORDER_SERVING]: memo(
    ({
      item,
      containerWidth,
    }: {
      item: KitchenDishOrder;
      containerWidth?: number;
    }) => (
      <KitchenDishOrderServingCard
        dishOrder={item}
        containerWidth={containerWidth}
      />
    ),
  ),

  // eslint-disable-next-line react/display-name
  [ItemTypeFlatList.KITCHEN_COOKED_HISTORY]: memo(
    ({
      item,
      containerWidth,
    }: {
      item: KitchenLog;
      containerWidth?: number;
    }) => (
      <KitchenCookedHistoryCard
        cookedHistory={item}
        containerWidth={containerWidth}
      />
    ),
  ),

  // eslint-disable-next-line react/display-name
  [ItemTypeFlatList.KITCHEN_SERVED_HISTORY]: memo(
    ({
      item,
      containerWidth,
    }: {
      key: string;
      item: KitchenLog;
      containerWidth?: number;
    }) => (
      <KitchenServedHistoryCard
        servedHistory={item}
        containerWidth={containerWidth}
      />
    ),
  ),
};

// Memoized GroupList component
// eslint-disable-next-line react/display-name
const GroupList = memo(
  ({
    groups = [],
    scrollToGroup,
  }: {
    groups: any[];
    scrollToGroup: (id: string) => void;
  }) => {
    const theme = useTheme();
    const { width } = useWindowDimensions();

    const groupListStyle = useMemo(
      () => ({
        backgroundColor: theme.colors.background,
        ...(width < UNIVERSAL_WIDTH_PIVOT
          ? { paddingHorizontal: 8 }
          : { width: Math.min(UNIVERSAL_MAX_WIDTH_SIDEBAR, width * 0.15) }),
      }),
      [theme.colors.background, width],
    );

    const buttonStyle = useMemo(
      () => ({
        backgroundColor: theme.colors.primaryContainer,
        paddingVertical: 12,
        paddingHorizontal: width < UNIVERSAL_WIDTH_PIVOT ? 16 : 8,
        borderRadius: 4,
      }),
      [theme.colors.primaryContainer, width],
    );

    if (width < UNIVERSAL_WIDTH_PIVOT) {
      return (
        <Surface mode="flat" style={groupListStyle}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8, paddingVertical: 8 }}>
              {groups.map((g) => (
                <TouchableRipple
                  key={g.id}
                  onPress={() => scrollToGroup(g.id)}
                  style={buttonStyle}
                >
                  <Text
                    variant="bodyMedium"
                    style={{ flexWrap: "wrap", maxWidth: 200 }}
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
      <Surface mode="flat" style={groupListStyle}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ gap: 1 }}>
            {groups.map((g) => (
              <TouchableRipple
                key={g.id}
                onPress={() => scrollToGroup(g.id)}
                style={buttonStyle}
              >
                <Text variant="bodyMedium" style={{ flexWrap: "wrap" }}>
                  {g.name}
                </Text>
              </TouchableRipple>
            ))}
          </View>
        </ScrollView>
      </Surface>
    );
  },
);

export interface FlatListItem {
  id: string;
  type: string;
  group: any;
  startIdx?: number;
  items?: any[];
}

// Memoized EmptyCell component
// eslint-disable-next-line react/display-name
export const FlatListEmptyCell = memo(() => <View style={{ flex: 1 }} />);

// Memoized Header component
// eslint-disable-next-line react/display-name
export const FlatListHeaderItem = memo(({ group }: { group: any }) => (
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
));

// Memoized Loading component
// eslint-disable-next-line react/display-name
export const FlatListLoadingItem = memo(() => (
  <View
    style={{
      height: 80,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <ActivityIndicator size="large" />
  </View>
));

// Memoized Row component
// eslint-disable-next-line react/display-name
export const FlatListRowItem = memo(
  ({
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
  }) => {
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
        {items.map((_item: any) => (
          <ComponentType
            key={_item.id}
            item={_item}
            openMenu={openMenu}
            containerWidth={itemContainerWidth}
          />
        ))}
        {Array(Math.max(0, numColumns - items.length))
          .fill(null)
          .map((_, idx) => (
            <FlatListEmptyCell key={idx} />
          ))}
      </View>
    );
  },
);

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
  const flatListRef = useRef<FlashList<FlatListItem>>(null);

  const { itemContainerWidth, numColumns } = useMemo(() => {
    let itemContainerWidth = width - 52;
    if (width >= UNIVERSAL_WIDTH_PIVOT) {
      itemContainerWidth -= shouldShowGroup
        ? Math.min(width * 0.15, UNIVERSAL_MAX_WIDTH_SIDEBAR)
        : 0;
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

  const { flatListData, indexMap } = useMemo<{
    flatListData: FlatListItem[];
    indexMap: Record<string, number>;
  }>(() => {
    if (numColumns <= 0) {
      return { flatListData: [], indexMap: {} };
    }

    const flatListData: FlatListItem[] = [];
    const indexMap: Record<string, number> = {};

    groups.forEach((g) => {
      const items = itemByGroup[g.id] || [];

      // Add header
      indexMap[g.id] = flatListData.length;
      flatListData.push({ type: "header", id: `header-${g.id}`, group: g });

      // Add item rows
      for (let i = 0; i < items.length; i += numColumns) {
        flatListData.push({
          type: "row",
          id: `row-${g.id}-${i}`,
          items: items.slice(i, i + numColumns),
          startIdx: i,
          group: g,
        });
      }
    });

    return {
      flatListData,
      indexMap,
    };
  }, [groups, itemByGroup, numColumns]);

  const renderItem = useCallback(
    ({ item }: { item: FlatListItem }) => {
      if (item.type === "header") {
        return shouldShowGroup ? (
          <FlatListHeaderItem group={item.group} />
        ) : null;
      }

      if (item.type === "row") {
        return (
          <FlatListRowItem
            items={item.items || []}
            numColumns={numColumns}
            itemType={itemType}
            openMenu={openMenu}
            itemContainerWidth={itemContainerWidth}
          />
        );
      }

      return null;
    },
    [shouldShowGroup, numColumns, itemType, openMenu, itemContainerWidth],
  );

  const scrollToCategory = useCallback(
    (categoryId: string) => {
      const index = indexMap[categoryId];
      if (index !== undefined && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index });
      }
    },
    [indexMap],
  );

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
      <FlashList
        ref={flatListRef}
        data={flatListData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={
          ItemTypeFlatListProperties[itemType].ROW_HEIGHT +
          ItemTypeFlatListMarginBottom
        }
        contentContainerStyle={{ padding: 10 }}
        ListFooterComponent={() => children}
        removeClippedSubviews
        disableAutoLayout
      />
    </Surface>
  );
};

export default FlatListWithScroll;
