import {
  FlatList,
  GestureResponderEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import { DishCard } from "./ui/menus/DishCard";
import { Fragment, memo, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { Dish } from "../stores/state.interface";

export enum ItemTypeFlatList {
  DISH_CARD = "dishCard",
}

const MemoizedDishCard = memo(
  ({
    dish,
    openMenu,
    containerWidth,
  }: {
    dish: Dish;
    openMenu: (dish: Dish, event: any) => void;
    containerWidth?: number;
  }) => {
    return (
      <DishCard
        dish={dish}
        openMenu={openMenu}
        containerWidth={containerWidth}
      />
    );
  }
);

const ItemTypeMap = {
  dishCard: ({
    dish,
    openMenu,
    containerWidth,
  }: {
    dish: Dish;
    openMenu: (dish: Dish, event: any) => void;
    containerWidth?: number;
  }) => {
    return (
      <MemoizedDishCard
        dish={dish}
        openMenu={openMenu}
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

  if (width < 600) {
    return (
      <Surface
        style={{
          backgroundColor: theme.colors.background,
        }}
        mode="flat"
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
      style={[styles.sidebar, { backgroundColor: theme.colors.background }]}
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
  width,
  groups,
  itemByGroup,
  openMenu,
  itemType,
}: {
  width: number;
  groups: any[];
  itemByGroup: Record<string, any[]>;
  openMenu: (item: any, event: GestureResponderEvent) => void;
  itemType: ItemTypeFlatList;
}) {
  const [itemContainerWidth, setItemContainerWidth] = useState<number>(1);
  const numColumns = Math.floor(
    itemContainerWidth / Math.min(300, itemContainerWidth * 0.48)
  );

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
      return <Text style={styles.categoryTitle}>{item.group.name}</Text>;
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
    const HEADER_HEIGHT = 24;
    const ROW_HEIGHT = 288;
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
      style={{ flex: 1, flexDirection: width >= 600 ? "row" : "column" }}
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

const styles = StyleSheet.create({
  sidebar: {
    width: 120,
  },
  categoryButton: {
    padding: 0,
    borderRadius: 0,
  },
  dishList: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 12,
    padding: 8,
  },
  categoryTitle: {
    marginBottom: 8,
    height: 24,
  },
  createButton: {
    marginVertical: 10,
    alignSelf: "center",
  },
});
