import {
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  GestureResponderEvent,
  useWindowDimensions,
  View,
  ScrollView,
} from "react-native";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import {
  FlatListHeaderItem,
  FlatListItem,
  FlatListLoadingItem,
  FlatListRowItem,
  ItemTypeFlatList,
  ItemTypeFlatListMarginBottom,
  ItemTypeFlatListProperties,
} from "./FlatListUtil";
import {
  UNIVERSAL_MAX_WIDTH_SIDEBAR,
  UNIVERSAL_WIDTH_PIVOT,
} from "@/constants/common";
import { FlashList } from "@shopify/flash-list";

const GroupListMemoized = memo(function GroupList({
  groups = [],
  selectedGroup,
  setSelectedGroup,
}: {
  groups: any[];
  selectedGroup: string;
  setSelectedGroup: Dispatch<SetStateAction<string>>;
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
                onPress={() =>
                  setSelectedGroup((id) => (id === g.id ? "" : g.id))
                }
                style={{
                  backgroundColor:
                    selectedGroup === g.id
                      ? theme.colors.primary
                      : theme.colors.primaryContainer,
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
                    color: selectedGroup === g.id ? theme.colors.onPrimary : "",
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
        width: Math.min(UNIVERSAL_MAX_WIDTH_SIDEBAR, width * 0.15),
        backgroundColor: theme.colors.background,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 1 }}>
          {groups.map((g) => {
            return (
              <TouchableRipple
                key={g.id}
                onPress={() =>
                  setSelectedGroup((id) => (id === g.id ? "" : g.id))
                }
                style={{
                  backgroundColor:
                    selectedGroup === g.id
                      ? theme.colors.primary
                      : theme.colors.primaryContainer,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 4,
                }}
              >
                <Text
                  variant="bodyMedium"
                  style={{
                    flexWrap: "wrap",
                    color: selectedGroup === g.id ? theme.colors.onPrimary : "",
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
});

const FlatListWithoutScroll = ({
  groups,
  itemByGroup,
  openMenu,
  itemType,
  additionalDatas,
  shouldShowGroup = true,
  // New infinite scrolling props
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  onEndReachedThreshold = 0.5,
  children,
}: {
  groups: any[];
  itemByGroup: Record<string, any[]>;
  itemType: ItemTypeFlatList;
  additionalDatas?: any;
  openMenu?: (item: any, event: GestureResponderEvent) => void;
  shouldShowGroup?: boolean;
  // New infinite scrolling props
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  onEndReachedThreshold?: number;
  children?: ReactNode;
}) => {
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlashList<FlatListItem>>(null);

  const [selectedGroup, setSelectGroup] = useState("");
  const [hasTriggeredInitialLoad, setHasTriggeredInitialLoad] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);

  const { itemContainerWidth, numColumns } = useMemo(() => {
    let itemContainerWidth = width - 52; // minus padding
    if (width >= UNIVERSAL_WIDTH_PIVOT) {
      itemContainerWidth -= shouldShowGroup
        ? Math.min(width * 0.15, UNIVERSAL_MAX_WIDTH_SIDEBAR)
        : 0; // minus sidebar
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

  const flatListData = useMemo(() => {
    if (numColumns <= 0) {
      return [];
    }

    const data = groups.flatMap((g) => {
      if (selectedGroup && g.id !== selectedGroup) {
        return [];
      }

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

      return [{ type: "header", id: `header-${g.id}`, group: g }, ...itemRows];
    });

    // Add loading indicator at the end if we're fetching more data
    if (isFetchingNextPage && hasNextPage) {
      data.push({
        type: "loading",
        id: "loading-indicator",
        group: null,
      });
    }

    return data;
  }, [
    numColumns,
    groups,
    isFetchingNextPage,
    hasNextPage,
    selectedGroup,
    itemByGroup,
  ]);

  // Calculate total content height to determine if we need more items
  const totalContentHeight = useMemo(() => {
    const HEADER_HEIGHT = ItemTypeFlatListProperties[itemType].HEADER_HEIGHT;
    const ROW_HEIGHT = ItemTypeFlatListProperties[itemType].ROW_HEIGHT;
    const LOADING_HEIGHT = 80;
    const MARGIN_BOTTOM = 8;

    return flatListData.reduce((total, item) => {
      if (item.type === "header") {
        return total + (shouldShowGroup ? HEADER_HEIGHT : 0) + MARGIN_BOTTOM;
      } else if (item.type === "row") {
        return total + ROW_HEIGHT + MARGIN_BOTTOM;
      } else if (item.type === "loading") {
        return total + LOADING_HEIGHT + MARGIN_BOTTOM;
      }
      return total;
    }, 20); // Add some padding
  }, [flatListData, itemType, shouldShowGroup]);

  // Handle container layout to get actual height
  const handleContainerLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    setContainerHeight(height);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FlatListItem }) => {
      if (item.type === "header") {
        return shouldShowGroup ? (
          <FlatListHeaderItem group={item.group} />
        ) : null;
      }

      if (item.type === "loading") {
        return <FlatListLoadingItem />;
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

  const handleEndReached = useCallback(() => {
    // Prevent triggering on initial empty render
    if (flatListData.length === 0 && !hasTriggeredInitialLoad) {
      setHasTriggeredInitialLoad(true);
      if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
        fetchNextPage();
      }
      return;
    }

    if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    flatListData.length,
    hasTriggeredInitialLoad,
  ]);

  // Check if content height is less than viewport and we need more data
  useEffect(() => {
    const currentHeight = totalContentHeight % containerHeight;
    if (
      containerHeight > 0 &&
      flatListData.length > 0 &&
      currentHeight >= containerHeight * 0.5 &&
      hasNextPage &&
      !isFetchingNextPage &&
      fetchNextPage
    ) {
      // Small delay to avoid rapid successive calls
      const timer = setTimeout(() => {
        fetchNextPage();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [
    totalContentHeight,
    containerHeight,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    flatListData.length,
  ]);

  return (
    <Surface
      mode="flat"
      style={{
        flex: 1,
        flexDirection: width >= UNIVERSAL_WIDTH_PIVOT ? "row" : "column",
      }}
    >
      {shouldShowGroup && (
        <GroupListMemoized
          groups={groups}
          selectedGroup={selectedGroup}
          setSelectedGroup={(id) => {
            setSelectGroup(id);
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
        />
      )}
      <View style={{ flex: 1 }} onLayout={handleContainerLayout}>
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
          onEndReachedThreshold={onEndReachedThreshold}
          onEndReached={handleEndReached}
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

export default FlatListWithoutScroll;
