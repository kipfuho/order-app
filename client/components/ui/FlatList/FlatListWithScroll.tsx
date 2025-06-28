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
        <GroupListMemoized groups={groups} scrollToGroup={scrollToCategory} />
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
    </Surface>
  );
};

export default FlatListWithScroll;
