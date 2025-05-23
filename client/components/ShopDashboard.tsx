import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import DailySalesChart from "./ui/analytics/DailySalesChart";
import PopularDishesChart from "./ui/analytics/PopularDishesChart";
import HourlyDistributionChart from "./ui/analytics/HourlyDistributionChart";
import PaymentMethodsChart from "./ui/analytics/PaymentMethodsChart";
import { Icon, Surface, Text, useTheme } from "react-native-paper";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { CustomMD3Theme } from "../constants/theme";

const { width } = Dimensions.get("window");

const ShopDashboard = () => {
  const theme = useTheme<CustomMD3Theme>();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("sales");

  const renderDailySalesChart = () => <DailySalesChart width={width} />;
  const renderPopularDishesChart = () => <PopularDishesChart width={width} />;
  const renderHourlyDistributionChart = () => (
    <HourlyDistributionChart width={width} />
  );
  const renderPaymentMethodsChart = () => <PaymentMethodsChart width={width} />;

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <Surface
        style={[
          styles.summaryCard,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: theme.colors.primary }]}>
          {t("total_revenue")}
        </Text>
        <Text
          style={[
            styles.summaryValue,
            { color: theme.colors.onPrimaryContainer },
          ]}
        >
          $29,200
        </Text>
        <Text style={[styles.summarySubtitle, { color: theme.colors.primary }]}>
          {t("last_7days")}
        </Text>
      </Surface>

      <Surface
        style={[
          styles.summaryCard,
          { backgroundColor: theme.colors.secondaryContainer },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: theme.colors.secondary }]}>
          {t("report_order_count")}
        </Text>
        <Text
          style={[
            styles.summaryValue,
            { color: theme.colors.onSecondaryContainer },
          ]}
        >
          700
        </Text>
        <Text
          style={[styles.summarySubtitle, { color: theme.colors.secondary }]}
        >
          {t("last_7days")}
        </Text>
      </Surface>

      <Surface
        style={[
          styles.summaryCard,
          { backgroundColor: theme.colors.tertiaryContainer },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: theme.colors.tertiary }]}>
          {t("avg_order_value")}
        </Text>
        <Text
          style={[
            styles.summaryValue,
            { color: theme.colors.onTertiaryContainer },
          ]}
        >
          $41.71
        </Text>
        <Text
          style={[styles.summarySubtitle, { color: theme.colors.tertiary }]}
        >
          {t("last_7days")}
        </Text>
      </Surface>

      <Surface
        style={[
          styles.summaryCard,
          { backgroundColor: theme.colors.yellowContainer },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: theme.colors.yellow }]}>
          {t("peak_hour")}
        </Text>
        <Text
          style={[
            styles.summaryValue,
            { color: theme.colors.onYellowContainer },
          ]}
        >
          7 PM
        </Text>
        <Text style={[styles.summarySubtitle, { color: theme.colors.yellow }]}>
          42 orders, $1,890
        </Text>
      </Surface>
    </View>
  );

  return (
    <Surface style={{ flex: 1, gap: 8 }}>
      <Surface
        mode="flat"
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
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
              borderBottomColor: theme.colors.primary,
            },
          ]}
          onPress={() => setActiveTab("sales")}
        >
          <Icon
            source="chart-line"
            size={16}
            color={
              activeTab === "sales"
                ? theme.colors.primary
                : theme.colors.secondary
            }
          />
          <Text
            style={[
              {
                fontSize: 12,
              },
              activeTab === "sales" && {
                color: theme.colors.primary,
                fontWeight: "bold",
              },
            ]}
          >
            {t("report_sales")}
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
              borderBottomColor: theme.colors.primary,
            },
          ]}
          onPress={() => setActiveTab("dishes")}
        >
          <Icon
            source="food"
            size={16}
            color={
              activeTab === "sales"
                ? theme.colors.primary
                : theme.colors.secondary
            }
          />
          <Text
            style={[
              {
                fontSize: 12,
              },
              activeTab === "dishes" && {
                color: theme.colors.primary,
                fontWeight: "bold",
              },
            ]}
          >
            {t("report_dishes")}
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
              borderBottomColor: theme.colors.primary,
            },
          ]}
          onPress={() => setActiveTab("hourly")}
        >
          <Icon
            source="clock-outline"
            size={16}
            color={
              activeTab === "sales"
                ? theme.colors.primary
                : theme.colors.secondary
            }
          />
          <Text
            style={[
              {
                fontSize: 12,
              },
              activeTab === "hourly" && {
                color: theme.colors.primary,
                fontWeight: "bold",
              },
            ]}
          >
            {t("report_hourly")}
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
              borderBottomColor: theme.colors.primary,
            },
          ]}
          onPress={() => setActiveTab("payment")}
        >
          <Icon
            source="credit-card-outline"
            size={16}
            color={
              activeTab === "sales"
                ? theme.colors.primary
                : theme.colors.secondary
            }
          />
          <Text
            style={[
              {
                fontSize: 12,
              },
              activeTab === "payment" && {
                color: theme.colors.primary,
                fontWeight: "bold",
              },
            ]}
          >
            {t("report_payment")}
          </Text>
        </TouchableOpacity>
      </Surface>
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
    </Surface>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    width: "48%",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
