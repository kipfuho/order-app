import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { VictoryPie } from "victory-native";

const paymentData = [
  { paymentMethod: "Credit Card", percentage: 68 },
  { paymentMethod: "Cash", percentage: 15 },
  { paymentMethod: "Mobile Pay", percentage: 12 },
  { paymentMethod: "Gift Card", percentage: 5 },
];

const generateColors = (count: number): string[] => {
  const saturation = 70;
  const lightness = 50;
  return Array.from({ length: count }, (_, i) => {
    const hue = Math.round((360 / count) * i);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  });
};

const PaymentMethodsChart = ({ width }: { width: number }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const chartColors = generateColors(paymentData.length);

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
        {t("payment_method_report_distribution")}
      </Text>
      <View style={{ alignItems: "center" }}>
        <VictoryPie
          data={paymentData}
          x={(datum) => t(datum.paymentMethod)}
          y="value"
          width={width}
          height={400}
          colorScale={chartColors}
          style={{
            labels: {
              fontSize: 10,
              fill: theme.colors.onBackground,
            },
          }}
          labelRadius={({ innerRadius }) =>
            (typeof innerRadius === "number" ? innerRadius : 0) + 85
          }
          innerRadius={70}
          labelPlacement="perpendicular"
          labels={({ datum }) => `${datum.name}\n${datum.value}%`}
        />
      </View>
      <Text
        style={{
          fontSize: 12,
          marginTop: 10,
        }}
      >
        {t("payment_method_report_description")}
      </Text>
    </Surface>
  );
};

export default PaymentMethodsChart;
