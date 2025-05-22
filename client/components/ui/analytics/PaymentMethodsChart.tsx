import { View } from "react-native";
import { Text } from "react-native-paper";
import { VictoryPie } from "victory-native";

const paymentData = [
  { name: "Credit Card", value: 68, color: "#0088FE" },
  { name: "Cash", value: 15, color: "#00C49F" },
  { name: "Mobile Pay", value: 12, color: "#FFBB28" },
  { name: "Gift Card", value: 5, color: "#FF8042" },
];

const PaymentMethodsChart = ({ width }: { width: number }) => {
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
        Payment Method Distribution (%)
      </Text>
      <View style={{ alignItems: "center" }}>
        <VictoryPie
          data={paymentData}
          x="name"
          y="value"
          width={width * 0.8}
          height={300}
          colorScale={paymentData.map((item) => item.color)}
          style={{
            labels: {
              fontSize: 10,
              fill: "#000",
              padding: 10,
            },
          }}
          labelRadius={({ innerRadius }) =>
            (typeof innerRadius === "number" ? innerRadius : 0) + 65
          }
          innerRadius={70}
          labelPlacement="perpendicular"
          labels={({ datum }) => `${datum.name}\n${datum.value}%`}
        />
      </View>
      <Text
        style={{
          fontSize: 12,
          color: "#6B7280",
          marginTop: 10,
        }}
      >
        This chart shows the distribution of payment methods used by your
        customers, helping you understand their preferences.
      </Text>
    </View>
  );
};

export default PaymentMethodsChart;
