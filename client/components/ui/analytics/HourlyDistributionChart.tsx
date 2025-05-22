import { View } from "react-native";
import { Text } from "react-native-paper";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLegend,
  VictoryTheme,
} from "victory-native";

const hourlyData = [
  { hour: "11 AM", orders: 12, revenue: 540 },
  { hour: "12 PM", orders: 28, revenue: 1260 },
  { hour: "1 PM", orders: 31, revenue: 1395 },
  { hour: "2 PM", orders: 18, revenue: 810 },
  { hour: "5 PM", orders: 22, revenue: 990 },
  { hour: "6 PM", orders: 36, revenue: 1620 },
  { hour: "7 PM", orders: 42, revenue: 1890 },
  { hour: "8 PM", orders: 38, revenue: 1710 },
  { hour: "9 PM", orders: 25, revenue: 1125 },
];

const HourlyDistributionChart = ({ width }: { width: number }) => {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
        Hourly Sales Distribution
      </Text>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 20 }}
        width={width * 0.9}
        height={300}
      >
        <VictoryAxis
          tickFormat={(t) => t}
          style={{
            tickLabels: { fontSize: 8, padding: 5 },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => `${t}`}
          style={{
            tickLabels: { fontSize: 8, padding: 5 },
          }}
        />
        <VictoryBar
          data={hourlyData}
          x="hour"
          y="orders"
          style={{
            data: { fill: "#8884d8" },
          }}
        />
        <VictoryLegend
          x={125}
          y={0}
          orientation="horizontal"
          gutter={20}
          style={{
            labels: { fontSize: 10 },
          }}
          data={[{ name: "Orders", symbol: { fill: "#8884d8" } }]}
        />
      </VictoryChart>
      <Text
        style={{
          fontSize: 12,
          color: "#6B7280",
          marginTop: 10,
        }}
      >
        This chart displays sales activity by hour, helping you identify peak
        times and optimize staffing and inventory accordingly.
      </Text>
    </View>
  );
};

export default HourlyDistributionChart;
