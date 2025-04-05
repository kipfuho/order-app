import _ from "lodash";
import { TableForOrder } from "../../../stores/state.interface";
import { Card, Divider, Icon, Surface, Text } from "react-native-paper";
import { TouchableOpacity, View } from "react-native";

const getTimeColorByCode = (code: number | undefined) => {
  if (code === 1) return "green";
  if (code === 2) return "yellow";
  return "red";
};

const getTimeColorByTimeDifferent = (minutesSinceOrderCreated: number) => {
  if (minutesSinceOrderCreated <= 5) return "green";
  if (minutesSinceOrderCreated <= 15) return "yellow";
  return "red";
};

const TableForOrderCurrentInfo = ({ table }: { table: TableForOrder }) => {
  if (table.numberOfOrderSession) {
    const now = Date.now();
    const minutesSinceOrderCreated = Math.floor(
      (now - (table.orderCreatedAtEpoch ?? now)) / (1000 * 60)
    );

    return (
      <Surface style={{ flex: 1, padding: 8 }}>
        {/* Row: Customers and Order ID */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {table.numberOfCustomer}
          </Text>
          <Text style={{ fontSize: 12, marginLeft: 2 }}>P</Text>
          <Text
            style={{
              fontSize: 16,
              color: getTimeColorByTimeDifferent(minutesSinceOrderCreated),
              marginLeft: 8,
              fontWeight: "bold",
            }}
          >
            {minutesSinceOrderCreated}
          </Text>
          <Text style={{ fontSize: 12, marginLeft: 2 }}>m</Text>
        </View>

        {/* Total payment */}
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {(table.totalPaymentAmount ?? 0).toLocaleString()} đ
        </Text>

        {/* Avg per customer */}
        <Text style={{ fontSize: 12, color: "grey" }}>
          {(table.averagePaymentAmount ?? 0).toLocaleString()} đ / P
        </Text>
      </Surface>
    );
  }

  return (
    <Surface
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Icon source="plus-circle-outline" size={30} />
    </Surface>
  );
};

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
        <TableForOrderCurrentInfo table={table} />
      </Card>
    </TouchableOpacity>
  );
};
