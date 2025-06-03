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
import { convertPaymentAmount } from "@constants/utils";
import { HourlySalesReportItem } from "@/stores/state.interface";

const normalize = (range: number[], props: string) => (datum: any) => {
  return (datum[props] - range[0]) / (range[1] - range[0]) || 0;
};

const HourlyDistributionChart = ({
  width,
  data,
}: {
  width: number;
  data: HourlySalesReportItem[];
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

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
          data={data}
          x="hour"
          y={normalize(revenueRange, "revenue")}
          style={{
            data: { fill: theme.colors.primary },
          }}
        />
        <VictoryLine
          data={data}
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
