import { useTranslation } from "react-i18next";
import { Surface, Text, useTheme } from "react-native-paper";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryLegend,
  VictoryTheme,
} from "victory-native";
import { convertPaymentAmount } from "@constants/utils";

const dishData = [
  { name: "Grilled Salmon", quantity: 87, revenue: 1740000 },
  { name: "NY Strip Steak", quantity: 72, revenue: 2160000 },
  { name: "Veggie Pasta", quantity: 63, revenue: 1134000 },
  { name: "Chicken Parmesan", quantity: 58, revenue: 1160000 },
  { name: "Lobster Risotto", quantity: 45, revenue: 1575000 },
];

const PopularDishesChart = ({ width }: { width: number }) => {
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
        {t("top_5dishes")}
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
              fontSize: 12,
              padding: 5,
              angle: 0,
              fill: theme.colors.onBackground,
            },
          }}
        />
        <VictoryBar
          data={dishData}
          x="name"
          y="quantity"
          style={{
            data: { fill: theme.colors.primary },
          }}
          labels={({ datum }) => [
            `${datum.quantity} ${t("unit").toLowerCase()}`,
            convertPaymentAmount(datum.revenue),
          ]}
          labelComponent={
            <VictoryLabel
              dy={10}
              y={105}
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
            { name: t("unit_sold"), symbol: { fill: theme.colors.primary } },
          ]}
        />
      </VictoryChart>
      <Text
        style={{
          fontSize: 12,
          marginTop: 10,
        }}
      >
        {t("dishes_report_description")}
      </Text>
    </Surface>
  );
};

export default PopularDishesChart;
