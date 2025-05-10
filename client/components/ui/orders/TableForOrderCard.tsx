import _ from "lodash";
import { TableForOrder } from "../../../stores/state.interface";
import { Card, Icon, Surface, Text, useTheme } from "react-native-paper";
import { TouchableOpacity, View } from "react-native";
import { convertPaymentAmount } from "../../../constants/utils";
import { memo } from "react";

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

export const TableForOrderCurrentInfo = memo(
  ({ table }: { table: TableForOrder }) => {
    const theme = useTheme();

    if (table.numberOfOrderSession) {
      const now = Date.now();
      const minutesSinceOrderCreated = Math.floor(
        (now - (table.orderCreatedAtEpoch ?? now)) / (1000 * 60)
      );

      return (
        <Surface
          mode="flat"
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 5,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            backgroundColor: theme.colors.secondaryContainer,
            boxShadow: "none",
          }}
        >
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
            {convertPaymentAmount(table.totalPaymentAmount)}
          </Text>

          {/* Avg per customer */}
          <Text style={{ fontSize: 12, color: "grey" }}>
            {convertPaymentAmount(table.averagePaymentAmount)} / P
          </Text>
        </Surface>
      );
    }

    return (
      <Surface
        mode="flat"
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 5,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          boxShadow: "none",
        }}
      >
        <Icon source="plus-circle-outline" size={30} />
      </Surface>
    );
  }
);

export const TableForOrderCard = memo(
  ({
    table,
    onClick,
  }: {
    table: TableForOrder;
    onClick: (tableId: string) => void;
  }) => {
    const theme = useTheme();
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
          <TableForOrderCurrentInfo table={table} />
        </Card>
      </TouchableOpacity>
    );
  }
);
