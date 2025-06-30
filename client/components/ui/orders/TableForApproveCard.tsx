import { memo } from "react";
import {
  Card,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { Table } from "@stores/state.interface";

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
    <TouchableRipple
      onPress={() => onClick(table.id)}
      style={{ borderRadius: 5 }}
    >
      <Card
        style={{
          margin: 10,
          width: 120,
          height: 150,
          borderRadius: 5,
          marginHorizontal: 5,
          marginVertical: 5,
        }}
        mode="elevated"
        contentStyle={{ flex: 1 }}
      >
        {/* Table name */}
        <Surface
          mode="flat"
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
        </Surface>
        <Surface
          mode="flat"
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
        </Surface>
      </Card>
    </TouchableRipple>
  );
};
export default memo(TableForApproveCard);
