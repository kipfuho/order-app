import _ from "lodash";
import { useTranslation } from "react-i18next";
import { Surface, Text, useTheme } from "react-native-paper";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLegend,
  VictoryLine,
  VictoryTheme,
} from "victory-native";
import { convertPaymentAmount } from "@constants/utils";
import { DailySalesReportItem } from "@/stores/state.interface";

const normalize = (range: number[], props: string) => (datum: any) =>
  (datum[props] - range[0]) / (range[1] - range[0]);

const DailySalesChart = ({
  width,
  data,
}: {
  width: number;
  data: DailySalesReportItem[];
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const revenueRange = [
    (_.minBy(data, "revenue")?.revenue || 0) * 0.6,
    _.maxBy(data, "revenue")?.revenue || 0,
  ];
  const ordersRange = [
    (_.minBy(data, "orders")?.orders || 0) * 0.6,
    _.maxBy(data, "orders")?.orders || 0,
  ];

  return (
    <Surface
      style={{
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        {t("daily_sales_trend")} ({t("last_7days")})
      </Text>
      <VictoryChart
        theme={VictoryTheme.clean}
        domainPadding={{ x: 50, y: [10, 50] }}
        width={width}
        height={400}
      >
        <VictoryAxis
          style={{
            tickLabels: {
              fontSize: 12,
              padding: 5,
              angle: -30,
              fill: theme.colors.onBackground,
            },
          }}
        />

        {/* Revenue Line */}
        <VictoryLine
          data={data}
          x="date"
          y={normalize(revenueRange, "revenue")}
          labels={({ datum }) => [
            `${datum.orders} ${t("report_order")}`,
            convertPaymentAmount(datum.revenue),
          ]}
          labelComponent={
            <VictoryLabel
              y={93}
              style={[
                {
                  fill: theme.colors.secondary,
                  fontFamily: "monospace",
                },
                {
                  fill: theme.colors.primary,
                  fontFamily: "monospace",
                },
              ]}
            />
          }
          style={{
            data: { stroke: theme.colors.primary, strokeWidth: 2 },
          }}
        />

        {/* Orders Line */}
        <VictoryLine
          data={data}
          x="date"
          y={normalize(ordersRange, "orders")}
          style={{
            data: { stroke: theme.colors.secondary, strokeWidth: 2 },
          }}
        />

        <VictoryLegend
          x={50}
          y={0}
          orientation="horizontal"
          gutter={20}
          style={{
            labels: { fontSize: 12, fill: theme.colors.onBackground },
          }}
          data={[
            {
              name: t("report_revenue"),
              symbol: { fill: theme.colors.primary },
            },
            {
              name: t("report_order_count"),
              symbol: { fill: theme.colors.secondary },
            },
          ]}
        />
      </VictoryChart>

      <Text
        style={{
          fontSize: 12,
          marginTop: 10,
        }}
      >
        {t("daily_sales_description")}
      </Text>
    </Surface>
  );
};

export default DailySalesChart;
