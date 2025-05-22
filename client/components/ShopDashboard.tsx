import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryLine,
  VictoryAxis,
  VictoryPie,
  VictoryLabel,
  VictoryLegend,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryCursorContainer,
  VictoryScatter,
} from "victory-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DailySalesChart from "./ui/analytics/DailySalesChart";
import PopularDishesChart from "./ui/analytics/PopularDishesChart";
import HourlyDistributionChart from "./ui/analytics/HourlyDistributionChart";
import PaymentMethodsChart from "./ui/analytics/PaymentMethodsChart";
import { Surface } from "react-native-paper";
import _ from "lodash";

const { width } = Dimensions.get("window");

const ShopDashboard = () => {
  const [activeTab, setActiveTab] = useState("sales");

  const renderDailySalesChart = () => <DailySalesChart width={width} />;

  const renderPopularDishesChart = () => <PopularDishesChart width={width} />;

  const renderHourlyDistributionChart = () => (
    <HourlyDistributionChart width={width} />
  );

  const renderPaymentMethodsChart = () => <PaymentMethodsChart width={width} />;

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={[styles.summaryCard, { backgroundColor: "#E6F0FF" }]}>
        <Text style={[styles.summaryTitle, { color: "#003399" }]}>
          Total Revenue
        </Text>
        <Text style={[styles.summaryValue, { color: "#001F5C" }]}>$29,200</Text>
        <Text style={[styles.summarySubtitle, { color: "#0055CC" }]}>
          Last 7 days
        </Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: "#E6F9F1" }]}>
        <Text style={[styles.summaryTitle, { color: "#006644" }]}>
          Total Orders
        </Text>
        <Text style={[styles.summaryValue, { color: "#00331A" }]}>700</Text>
        <Text style={[styles.summarySubtitle, { color: "#00994D" }]}>
          Last 7 days
        </Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: "#F3E6FF" }]}>
        <Text style={[styles.summaryTitle, { color: "#5200CC" }]}>
          Avg Order Value
        </Text>
        <Text style={[styles.summaryValue, { color: "#2B0066" }]}>$41.71</Text>
        <Text style={[styles.summarySubtitle, { color: "#7700FF" }]}>
          Last 7 days
        </Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: "#FFF9E6" }]}>
        <Text style={[styles.summaryTitle, { color: "#996600" }]}>
          Peak Hour
        </Text>
        <Text style={[styles.summaryValue, { color: "#664400" }]}>7 PM</Text>
        <Text style={[styles.summarySubtitle, { color: "#CC8800" }]}>
          42 orders, $1,890
        </Text>
      </View>
    </View>
  );

  return (
    <Surface style={{ flex: 1 }}>
      <ScrollView
        style={{
          flex: 1,
          padding: 16,
        }}
      >
        {activeTab === "sales" && renderDailySalesChart()}
        {activeTab === "dishes" && renderPopularDishesChart()}
        {activeTab === "hourly" && renderHourlyDistributionChart()}
        {activeTab === "payment" && renderPaymentMethodsChart()}

        {renderSummaryCards()}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <TouchableOpacity
          style={[
            {
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              gap: 4,
            },
            activeTab === "sales" && {
              borderBottomWidth: 2,
              borderBottomColor: "#4F46E5",
            },
          ]}
          onPress={() => setActiveTab("sales")}
        >
          <MaterialCommunityIcons
            name="chart-line"
            size={16}
            color={activeTab === "sales" ? "#4F46E5" : "#6B7280"}
          />
          <Text
            style={[
              {
                fontSize: 12,
                color: "#6B7280",
              },
              activeTab === "sales" && {
                color: "#4F46E5",
                fontWeight: "bold",
              },
            ]}
          >
            Sales
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            {
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              gap: 4,
            },
            activeTab === "dishes" && {
              borderBottomWidth: 2,
              borderBottomColor: "#4F46E5",
            },
          ]}
          onPress={() => setActiveTab("dishes")}
        >
          <MaterialCommunityIcons
            name="food"
            size={16}
            color={activeTab === "dishes" ? "#4F46E5" : "#6B7280"}
          />
          <Text
            style={[
              {
                fontSize: 12,
                color: "#6B7280",
              },
              activeTab === "dishes" && {
                color: "#4F46E5",
                fontWeight: "bold",
              },
            ]}
          >
            Dishes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            {
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              gap: 4,
            },
            activeTab === "hourly" && {
              borderBottomWidth: 2,
              borderBottomColor: "#4F46E5",
            },
          ]}
          onPress={() => setActiveTab("hourly")}
        >
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={activeTab === "hourly" ? "#4F46E5" : "#6B7280"}
          />
          <Text
            style={[
              {
                fontSize: 12,
                color: "#6B7280",
              },
              activeTab === "hourly" && {
                color: "#4F46E5",
                fontWeight: "bold",
              },
            ]}
          >
            Hourly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            {
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              gap: 4,
            },
            activeTab === "payment" && {
              borderBottomWidth: 2,
              borderBottomColor: "#4F46E5",
            },
          ]}
          onPress={() => setActiveTab("payment")}
        >
          <MaterialCommunityIcons
            name="credit-card-outline"
            size={16}
            color={activeTab === "payment" ? "#4F46E5" : "#6B7280"}
          />
          <Text
            style={[
              {
                fontSize: 12,
                color: "#6B7280",
              },
              activeTab === "payment" && {
                color: "#4F46E5",
                fontWeight: "bold",
              },
            ]}
          >
            Payment
          </Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4F46E5",
  },
  tabText: {
    fontSize: 12,
    color: "#6B7280",
  },
  activeTabText: {
    color: "#4F46E5",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  chartDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 10,
  },
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 4,
  },
  summarySubtitle: {
    fontSize: 10,
  },
});

export default ShopDashboard;
