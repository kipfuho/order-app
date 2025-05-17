import {
  FlatList,
  GestureResponderEvent,
  useWindowDimensions,
  View,
} from "react-native";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import {
  Dispatch,
  Fragment,
  memo,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { ScrollView } from "react-native";
import {
  FlatListItem,
  flatListStyles,
  ItemTypeFlatList,
  ItemTypeFlatListProperties,
  ItemTypeMap,
  UNIVERSAL_WIDTH_PIVOT,
} from "./FlatListWithScroll";

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
}: {
  groups: any[];
  itemByGroup: Record<string, any[]>;
  itemType: ItemTypeFlatList;
  additionalDatas?: any;
  openMenu?: (item: any, event: GestureResponderEvent) => void;
  shouldShowGroup?: boolean;
}) => {
  const flatListRef = useRef<FlatList<any>>(null);
  const { width } = useWindowDimensions();

  const [selectedGroup, setSelectGroup] = useState("");
  const [itemContainerWidth, setItemContainerWidth] = useState<number>(1);
  const [numColumns, setNumColumns] = useState<number>(0);

  const flatListData = groups.flatMap((g) => {
    if (numColumns <= 0 || (selectedGroup && g.id !== selectedGroup)) {
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
      <FlatList
        ref={flatListRef}
        data={flatListData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
      />
    </Surface>
  );
};

export default memo(FlatListWithoutScroll);
