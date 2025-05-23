import _ from "lodash";
import { useTranslation } from "react-i18next";
import { Surface, Text, useTheme } from "react-native-paper";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryLegend,
  VictoryLine,
  VictoryTheme,
} from "victory-native";
import { convertPaymentAmount } from "../../../constants/utils";

const hourlyData = [
  { hour: "1 AM", orders: 12, revenue: 540000 },
  { hour: "2 AM", orders: 31, revenue: 540000 },
  { hour: "3 AM", orders: 12, revenue: 540000 },
  { hour: "4 AM", orders: 31, revenue: 15400000 },
  { hour: "5 AM", orders: 12, revenue: 540000 },
  { hour: "6 AM", orders: 31, revenue: 540000 },
  { hour: "7 AM", orders: 12, revenue: 990000 },
  { hour: "8 AM", orders: 31, revenue: 540000 },
  { hour: "9 AM", orders: 12, revenue: 540000 },
  { hour: "10 AM", orders: 12, revenue: 990000 },
  { hour: "11 AM", orders: 31, revenue: 540000 },
  { hour: "12 PM", orders: 28, revenue: 1260000 },
  { hour: "1 PM", orders: 31, revenue: 1395000 },
  { hour: "2 PM", orders: 18, revenue: 810000 },
  { hour: "5 PM", orders: 22, revenue: 990000 },
  { hour: "6 PM", orders: 36, revenue: 1620000 },
  { hour: "7 PM", orders: 42, revenue: 1890000 },
  { hour: "8 PM", orders: 38, revenue: 1710000 },
  { hour: "9 PM", orders: 25, revenue: 1126000 },
];

const revenueRange = [
  (_.minBy(hourlyData, "revenue")?.revenue || 0) * 0.6,
  _.maxBy(hourlyData, "revenue")?.revenue || 0,
];
const ordersRange = [
  (_.minBy(hourlyData, "orders")?.orders || 0) * 0.6,
  _.maxBy(hourlyData, "orders")?.orders || 0,
];

const normalize = (range: number[], props: string) => (datum: any) =>
  (datum[props] - range[0]) / (range[1] - range[0]);

const HourlyDistributionChart = ({ width }: { width: number }) => {
  const theme = useTheme();
  const { t } = useTranslation();

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
        {t("hourly_distribution")}
      </Text>
      <VictoryChart
        theme={VictoryTheme.clean}
        domainPadding={{ x: 50, y: [10, 100] }}
        width={width}
        height={400}
      >
        <VictoryAxis
          tickFormat={(t) => t}
          style={{
            tickLabels: {
              angle: -30,
              fontSize: 8,
              padding: 5,
              fill: theme.colors.onBackground,
            },
          }}
        />
        <VictoryBar
          data={hourlyData}
          x="hour"
          y={normalize(revenueRange, "revenue")}
          style={{
            data: { fill: theme.colors.primary },
          }}
        />
        <VictoryLine
          data={hourlyData}
          x="hour"
          y={normalize(ordersRange, "orders")}
          style={{
            data: { stroke: theme.colors.secondary, strokeWidth: 2 },
          }}
          labels={({ datum }) => [
            datum.orders,
            convertPaymentAmount(datum.revenue),
          ]}
          labelComponent={
            <VictoryLabel
              dy={10}
              y={105}
              angle={90}
              style={[
                {
                  fill: theme.colors.secondary,
                  fontSize: 10,
                  fontFamily: "monospace",
                },
                {
                  fill: theme.colors.primary,
                  fontSize: 10,
                  fontFamily: "monospace",
                },
              ]}
            />
          }
        />

        <VictoryLegend
          x={125}
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
        {t("hourly_description")}
      </Text>
    </Surface>
  );
};

export default HourlyDistributionChart;
