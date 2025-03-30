import _ from "lodash";
import { TableForOrder } from "../../../stores/state.interface";
import {
  Card,
  Divider,
  Icon,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { TouchableOpacity } from "react-native";

export const TableForOrderCard = ({
  table,
  onClick,
}: {
  table: TableForOrder;
  onClick: (tableId: string) => void;
}) => {
  return (
    <TouchableOpacity onPress={() => onClick(table.id)} activeOpacity={1}>
      <Card
        style={{
          margin: 10,
          width: 120,
          height: 150,
          borderRadius: 5,
          marginHorizontal: 5,
          marginVertical: 5,
        }}
        mode="contained"
        contentStyle={{ flex: 1 }}
      >
        {/* Table name */}
        <Text style={{ padding: 8 }} numberOfLines={1}>
          {table.name}
        </Text>
        <Divider style={{ borderWidth: 1 }} />
        {!_.isEmpty(table.activeOrderSessions) ? (
          <Surface style={{ flex: 1 }}>
            <Text>{table.activeOrderSessions[0].numberOfCustomer} P</Text>
          </Surface>
        ) : (
          <Surface
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Icon source="plus-circle-outline" size={30} />
          </Surface>
        )}
      </Card>
    </TouchableOpacity>
  );
};
