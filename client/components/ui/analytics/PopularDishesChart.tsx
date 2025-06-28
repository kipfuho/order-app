import { useTranslation } from "react-i18next";
import { Surface, Text, useTheme } from "react-native-paper";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLegend,
  VictoryTheme,
  VictoryTooltip,
} from "victory-native";
import { convertPaymentAmount } from "@constants/utils";
import { PopularDishesReportItem } from "@/stores/state.interface";

const PopularDishesChart = ({
  width,
  data,
}: {
  width: number;
  data: PopularDishesReportItem[];
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Surface
      style={{
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        alignItems: "center",
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
          tickFormat={(tick) => {
            try {
              const words = tick.split(" ");
              if (words.length <= 1) return tick;

              // Group words into lines of ~15 characters
              const lines: string[] = [];
              let currentLine = "";

              words.forEach((word: string) => {
                if ((currentLine + " " + word).trim().length > 15) {
                  lines.push(currentLine.trim());
                  currentLine = word;
                } else {
                  currentLine += " " + word;
                }
              });

              if (currentLine) lines.push(currentLine.trim());

              return lines.join("\n");
            } catch {
              return tick;
            }
          }}
          style={{
            tickLabels: {
              fontSize: 12,
              padding: 5,
              fill: theme.colors.onBackground,
              textAnchor: "middle",
            },
          }}
        />
        <VictoryBar
          data={data}
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
            <VictoryTooltip
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
            { name: t("unit_sold"), symbol: { fill: theme.colors.secondary } },
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
