import {
  Dispatch,
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
  ActivityIndicator,
} from "react-native";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import { LegendList, LegendListRef } from "@legendapp/list";
import {
  FlatListItem,
  ItemTypeFlatList,
  ItemTypeFlatListProperties,
  ItemTypeMap,
} from "./FlatListWithScroll";
import {
  UNIVERSAL_MAX_WIDTH_SIDEBAR,
  UNIVERSAL_WIDTH_PIVOT,
} from "@/constants/common";

function GroupList({
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
}

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
}) => {
  const flatListRef = useRef<LegendListRef>(null);
  const { width } = useWindowDimensions();

  const [selectedGroup, setSelectGroup] = useState("");
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
    groups,
    itemByGroup,
    numColumns,
    selectedGroup,
    isFetchingNextPage,
    hasNextPage,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: FlatListItem }) => {
      if (item.type === "header") {
        if (!shouldShowGroup) return null;
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

      if (item.type === "loading") {
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
                key: `${itemType}-${_item.id || idx}`,
                item: _item,
                openMenu,
                containerWidth: itemContainerWidth,
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
    [itemType, itemContainerWidth, openMenu, numColumns, shouldShowGroup],
  );

  const HEADER_HEIGHT = ItemTypeFlatListProperties[itemType].HEADER_HEIGHT;
  const ROW_HEIGHT = ItemTypeFlatListProperties[itemType].ROW_HEIGHT;
  const LOADING_HEIGHT = 80;
  const MARGIN_BOTTOM = 8;

  const getEstimatedItemSize = (index: number, item: FlatListItem) => {
    if (item.type === "header") {
      return HEADER_HEIGHT + MARGIN_BOTTOM;
    } else if (item.type === "row") {
      return ROW_HEIGHT + MARGIN_BOTTOM;
    } else if (item.type === "loading") {
      return LOADING_HEIGHT + MARGIN_BOTTOM;
    }
    return 0;
  };

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        <GroupList
          groups={groups}
          selectedGroup={selectedGroup}
          setSelectedGroup={(id) => {
            setSelectGroup(id);
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
        />
      )}
      <LegendList
        ref={flatListRef}
        data={flatListData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        getEstimatedItemSize={getEstimatedItemSize}
        estimatedItemSize={ROW_HEIGHT + MARGIN_BOTTOM}
        initialContainerPoolRatio={1.5}
        onEndReached={handleEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        contentContainerStyle={{ padding: 10 }}
        showsHorizontalScrollIndicator={false}
      />
    </Surface>
  );
};

export default FlatListWithoutScroll;
