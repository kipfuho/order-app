import { memo } from "react";
import { View } from "react-native";
import {
  Icon,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { TableForOrder } from "@stores/state.interface";
import {
  convertPaymentAmount,
  getMinuteForDisplay,
  getStatusColor,
} from "@constants/utils";
import { CustomMD3Theme } from "@constants/theme";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useTranslation } from "react-i18next";

const TableForOrderCurrentInfoTime = ({ table }: { table: TableForOrder }) => {
  const theme = useTheme<CustomMD3Theme>();
  const now = useCurrentTime();
  const minutesSinceOrderCreated = getMinuteForDisplay({
    now,
    epochTime: table.orderCreatedAtEpoch,
  });

  return (
    <Text
      style={{
        fontSize: 16,
        color: getStatusColor(theme, minutesSinceOrderCreated).view,
        marginLeft: 8,
        fontWeight: "bold",
      }}
    >
      {minutesSinceOrderCreated}
    </Text>
  );
};

const MemoizedTableForOrderCurrentInfoTime = memo(TableForOrderCurrentInfoTime);

const TableForOrderCurrentInfo = ({ table }: { table: TableForOrder }) => {
  const { t } = useTranslation();

  if (table.numberOfOrderSession) {
    return (
      <View
        style={{
          flex: 1,
          padding: 8,
          borderRadius: 5,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        {/* Row: Customers and Order ID */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {table.numberOfCustomer}
          </Text>
          <Text style={{ fontSize: 12, marginLeft: 2 }}>P</Text>
          <MemoizedTableForOrderCurrentInfoTime table={table} />
          <Text style={{ fontSize: 12, marginLeft: 2 }}>
            {t("minute_short")}
          </Text>
        </View>

        {/* Total payment */}
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {convertPaymentAmount(table.totalPaymentAmount)}
        </Text>

        {/* Avg per customer */}
        <Text style={{ fontSize: 12, color: "grey" }}>
          {convertPaymentAmount(table.averagePaymentAmount)} / P
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      }}
    >
      <Icon source="plus-circle-outline" size={30} />
    </View>
  );
};

const MemoizedTableForOrderCurrentInfo = memo(TableForOrderCurrentInfo);

const TableForOrderCard = ({
  table,
  onClick,
}: {
  table: TableForOrder;
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
              backgroundColor: theme.colors.errorContainer,
              borderRadius: 5,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <Text
              style={{ padding: 8, color: theme.colors.onErrorContainer }}
              numberOfLines={1}
            >
              {table.name}
            </Text>
          </View>
          <MemoizedTableForOrderCurrentInfo table={table} />
        </View>
      </TouchableRipple>
    </Surface>
  );
};

export default memo(TableForOrderCard);
