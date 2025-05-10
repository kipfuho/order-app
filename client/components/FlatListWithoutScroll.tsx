import {
  FlatList,
  GestureResponderEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { ScrollView } from "react-native";
import {
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
              flexDirection: "row", // layout items in a row
              gap: 8, // spacing between items (RN 0.71+ supports `gap`)
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

interface Item {
  id: string;
  type: string;
  group: any;
  items?: any[];
}

export default function FlatListWithoutScroll({
  groups,
  itemByGroup,
  openMenu,
  itemType,
}: {
  groups: any[];
  itemByGroup: Record<string, any[]>;
  itemType: ItemTypeFlatList;
  openMenu?: (item: any, event: GestureResponderEvent) => void;
}) {
  const { width } = useWindowDimensions();

  const [selectedGroup, setSelectGroup] = useState("");
  const [itemContainerWidth, setItemContainerWidth] = useState<number>(1);
  const numColumns =
    Math.floor(
      itemContainerWidth /
        Math.min(
          ItemTypeFlatListProperties[itemType].MAX_WIDTH,
          itemContainerWidth * 0.48
        )
    ) || 0;

  const flatListData = groups.flatMap((g) => {
    if (selectedGroup && g.id !== selectedGroup) {
      return [];
    }

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

  const renderItem = ({ item }: { item: Item }) => {
    if (item.type === "header") {
      return (
        <Text style={flatListStyles.categoryTitle}>{item.group.name}</Text>
      );
    }

    if (item.type === "row") {
      console.log(numColumns);
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

  return (
    <Surface
      mode="flat"
      style={{
        flex: 1,
        flexDirection: width >= UNIVERSAL_WIDTH_PIVOT ? "row" : "column",
      }}
    >
      <GroupList
        groups={groups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectGroup}
      />
      <FlatList
        data={flatListData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setItemContainerWidth(width - 20);
        }}
        contentContainerStyle={{ padding: 10 }}
      />
    </Surface>
  );
}
