import { memo } from "react";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import { Table } from "@stores/state.interface";
import { View } from "react-native";

const TableForApproveCard = ({
  table,
  unconfirmedOrderCount,
  onClick,
}: {
  table: Table;
  unconfirmedOrderCount: number;
  onClick: (tableId: string) => void;
}) => {
  const theme = useTheme();
  return (
    <Surface
      style={{
        margin: 10,
        width: 120,
        height: 150,
        borderRadius: 5,
        marginHorizontal: 5,
        marginVertical: 5,
      }}
    >
      <TouchableRipple
        onPress={() => onClick(table.id)}
        style={{ borderRadius: 5, flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              backgroundColor: theme.colors.tertiaryContainer,
              borderRadius: 5,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <Text
              style={{ padding: 8, color: theme.colors.onTertiaryContainer }}
              numberOfLines={1}
            >
              {table.name}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {unconfirmedOrderCount > 0 && (
              <Text
                style={{
                  fontSize: 32,
                  color: theme.colors.error,
                  fontWeight: "bold",
                  width: 120,
                  textAlign: "center",
                }}
                numberOfLines={3}
              >
                {unconfirmedOrderCount}
              </Text>
            )}
          </View>
        </View>
      </TouchableRipple>
    </Surface>
  );
};
export default memo(TableForApproveCard);
