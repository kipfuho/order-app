import { View } from "react-native";
import { Text } from "react-native-paper";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLegend,
  VictoryTheme,
} from "victory-native";

const dishData = [
  { name: "Grilled Salmon", quantity: 87, revenue: 1740 },
  { name: "NY Strip Steak", quantity: 72, revenue: 2160 },
  { name: "Veggie Pasta", quantity: 63, revenue: 1134 },
  { name: "Chicken Parmesan", quantity: 58, revenue: 1160 },
  { name: "Lobster Risotto", quantity: 45, revenue: 1575 },
];

const PopularDishesChart = ({ width }: { width: number }) => {
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
        Top 5 Popular Dishes
      </Text>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 25 }}
        width={width * 0.9}
        height={300}
      >
        <VictoryAxis
          tickFormat={(t) => t}
          style={{
            tickLabels: { fontSize: 7, padding: 5, angle: -45 },
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
          data={dishData}
          x="name"
          y="quantity"
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
          data={[{ name: "Units Sold", symbol: { fill: "#8884d8" } }]}
        />
      </VictoryChart>
      <Text
        style={{
          fontSize: 12,
          color: "#6B7280",
          marginTop: 10,
        }}
      >
        This chart shows your top-selling dishes by quantity sold, helping you
        identify your most popular menu items.
      </Text>
    </View>
  );
};

export default PopularDishesChart;
