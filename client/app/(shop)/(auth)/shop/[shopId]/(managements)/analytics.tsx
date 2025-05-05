import { styles } from "../../../../../_layout";
import { Surface } from "react-native-paper";
import {
  BarChart,
  LineChart,
  PieChart,
  PopulationPyramid,
  RadarChart,
} from "react-native-gifted-charts";

export default function AnalyticManagementPage() {
  // ...
  const data = [{ value: 50 }, { value: 80 }, { value: 90 }, { value: 70 }];

  return (
    <Surface style={styles.baseContainer}>
      <BarChart data={data} />
      <LineChart data={data} />
      <PieChart data={data} />
      <PopulationPyramid
        data={[
          { left: 10, right: 12 },
          { left: 9, right: 8 },
        ]}
      />
      <RadarChart data={[50, 80, 90, 70]} />
      <BarChart />
      <BarChart data={data} horizontal />
      <LineChart data={data} areaChart />
      <PieChart data={data} donut />
    </Surface>
  );
}
