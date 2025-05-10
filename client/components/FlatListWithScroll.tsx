import {
  FlatList,
  GestureResponderEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import { DishCard } from "./ui/menus/DishCard";
import { Fragment, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { CartItem, Dish } from "../stores/state.interface";
import { DishCardForOrder } from "./ui/menus/DishCardForOrder";
import { DishCardForCustomer } from "./ui/menus/DishCardForCustomer";

export const UNIVERSAL_WIDTH_PIVOT = 600;

export enum ItemTypeFlatList {
  DISH_CARD = "dishCard",
  DISH_CARD_ORDER = "dishCardOrder",
  DISH_CARD_CUSTOMER = "dishCardCustomer",
}

export const ItemTypeFlatListProperties = {
  [ItemTypeFlatList.DISH_CARD]: {
    MAX_WIDTH: 300,
    HEADER_HEIGHT: 24,
    ROW_HEIGHT: 288,
  },
  [ItemTypeFlatList.DISH_CARD_ORDER]: {
    MAX_WIDTH: 200,
    HEADER_HEIGHT: 24,
    ROW_HEIGHT: 250,
  },
  [ItemTypeFlatList.DISH_CARD_CUSTOMER]: {
    MAX_WIDTH: 200,
    HEADER_HEIGHT: 24,
    ROW_HEIGHT: 294,
  },
};

export const ItemTypeMap = {
  [ItemTypeFlatList.DISH_CARD]: ({
    dish,
    openMenu,
    containerWidth,
  }: {
    dish: Dish;
    openMenu?: (dish: Dish, event: any) => void;
    containerWidth?: number;
  }) => {
    if (!openMenu) return;

    return (
      <DishCard
        dish={dish}
        openMenu={openMenu}
        containerWidth={containerWidth}
      />
    );
  },

  [ItemTypeFlatList.DISH_CARD_ORDER]: ({
    dish,
    containerWidth,
  }: {
    dish: Dish;
    containerWidth?: number;
  }) => {
    return <DishCardForOrder dish={dish} containerWidth={containerWidth} />;
  },

  [ItemTypeFlatList.DISH_CARD_CUSTOMER]: ({
    dish,
    containerWidth,
    additionalDatas,
  }: {
    dish: Dish;
    containerWidth?: number;
    additionalDatas: {
      cartItemsGroupByDish: Record<string, CartItem[]>;
    };
  }) => {
    return (
      <DishCardForCustomer
        dish={dish}
        containerWidth={containerWidth}
        cartItems={additionalDatas.cartItemsGroupByDish[dish.id]}
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
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flex: 1,
            flexDirection: "column",
            width: "25%",
          }}
        >
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

interface Item {
  id: string;
  type: string;
  group: any;
  items?: any[];
}

export default function FlatListWithScroll({
  groups,
  itemByGroup,
  openMenu,
  itemType,
  additionalDatas,
}: {
  groups: any[];
  itemByGroup: Record<string, any[]>;
  openMenu: (item: any, event: GestureResponderEvent) => void;
  additionalDatas?: any;
  itemType: ItemTypeFlatList;
}) {
  const { width } = useWindowDimensions();
  const [itemContainerWidth, setItemContainerWidth] = useState<number>(1);
  const numColumns =
    Math.floor(
      itemContainerWidth /
        Math.min(
          ItemTypeFlatListProperties[itemType].MAX_WIDTH,
          itemContainerWidth * 0.48
        )
    ) || 0;

  const flatListRef = useRef<FlatList<any>>(null);
  const flatListData = groups.flatMap((g) => {
    const items = itemByGroup[g.id] || [];

    const itemRows: Item[] = [];
    for (let i = 0; i < items.length; i += numColumns) {
      itemRows.push({
        type: "row",
        id: `row-${g.id}-${i}`,
        items: items.slice(i, i + numColumns),
        group: g,
      });
    }

    return [{ type: "header", id: `header-${g.id}`, group: g }, ...itemRows];
  });

  // For scrollToCategory
  const indexMap: Record<string, number> = {};
  flatListData.forEach((item: Item, index) => {
    if (item.type === "header") {
      indexMap[item.group!.id] = index;
    }
  });

  const renderItem = ({ item }: { item: Item }) => {
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
          {(item.items || []).map((item: any, idx: number) => (
            <Fragment key={idx}>
              {ItemTypeMap[itemType]({
                dish: item,
                openMenu,
                containerWidth: itemContainerWidth,
                additionalDatas,
              })}
            </Fragment>
          ))}
          {Array(Math.max(0, numColumns - (item.items || []).length))
            .fill(null)
            .map((_, idx) => (
              <View key={`empty-${idx}`} style={{ flex: 1 }} />
            ))}
        </View>
      );
    }

    return null;
  };

  const scrollToCategory = (categoryId: string) => {
    const index = indexMap[categoryId];
    if (index !== undefined && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const getItemLayout = (
    _: ArrayLike<Item> | null | undefined,
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
      <GroupList groups={groups} scrollToGroup={scrollToCategory} />
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
          setItemContainerWidth(width - 20);
        }}
        contentContainerStyle={{ padding: 10 }}
      />
    </Surface>
  );
}

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
