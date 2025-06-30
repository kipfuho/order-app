import { ReactNode, useCallback, useMemo, useRef, memo } from "react";
import {
  GestureResponderEvent,
  useWindowDimensions,
  View,
  ScrollView,
} from "react-native";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import {
  FlatListHeaderItem,
  FlatListItem,
  FlatListRowItem,
  ItemTypeFlatList,
  ItemTypeFlatListMarginBottom,
  ItemTypeFlatListProperties,
} from "./FlatListUtil";
import {
  UNIVERSAL_MAX_WIDTH_SIDEBAR,
  UNIVERSAL_WIDTH_PIVOT,
} from "@/constants/common";

// Memoized GroupList component
const GroupListMemoized = memo(function GroupList({
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
    <Surface
      mode="flat"
      style={{
        width: Math.min(UNIVERSAL_MAX_WIDTH_SIDEBAR, width * 0.15),
        backgroundColor: theme.colors.background,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 4 }}>
          {groups.map((g) => (
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
              <Text variant="bodyMedium" style={{ flexWrap: "wrap" }}>
                {g.name}
              </Text>
            </TouchableRipple>
          ))}
        </View>
      </ScrollView>
    </Surface>
  );
});

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
  itemType: ItemTypeFlatList;
  additionalDatas?: any;
  openMenu?: (item: any, event: GestureResponderEvent) => void;
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

    const indexMap: Record<string, number> = {};
    let currentIndex = 0;
    const data = groups.flatMap((g) => {
      const items = itemByGroup[g.id] || [];
      const itemRows: FlatListItem[] = [];
      for (let i = 0; i < items.length; i += numColumns) {
        itemRows.push({
          type: "row",
          id: `row-${g.id}-${i}`,
          items: items.slice(i, i + numColumns),
          startIdx: i,
          group: g,
        });
      }

      // set index for group
      indexMap[g.id] = currentIndex;
      currentIndex += itemRows.length + 1; // items + header
      return [{ type: "header", id: `header-${g.id}`, group: g }, ...itemRows];
    });

    return {
      flatListData: data,
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
    [itemType, itemContainerWidth, openMenu, numColumns, shouldShowGroup],
  );

  const scrollToCategory = useCallback(
    (categoryId: string) => {
      const index = indexMap[categoryId];
      if (index !== undefined && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true });
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
        <GroupListMemoized groups={groups} scrollToGroup={scrollToCategory} />
      )}
      <View style={{ flex: 1 }}>
        <FlashList
          ref={flatListRef}
          data={flatListData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={
            ItemTypeFlatListProperties[itemType].ROW_HEIGHT +
            ItemTypeFlatListMarginBottom
          }
          overrideItemLayout={(layout, item) => {
            layout.size =
              (item.type === "header"
                ? ItemTypeFlatListProperties[itemType].HEADER_HEIGHT
                : ItemTypeFlatListProperties[itemType].ROW_HEIGHT) +
              ItemTypeFlatListMarginBottom;
          }}
          getItemType={(item) => item.type}
          contentContainerStyle={{ padding: 10 }}
          ListFooterComponent={() => children}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews
          disableAutoLayout
        />
      </View>
    </Surface>
  );
};

export default FlatListWithScroll;
