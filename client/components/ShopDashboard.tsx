import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Icon, Surface, Text, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import DailySalesChart from "./ui/analytics/DailySalesChart";
import PopularDishesChart from "./ui/analytics/PopularDishesChart";
import HourlyDistributionChart from "./ui/analytics/HourlyDistributionChart";
import PaymentMethodsChart from "./ui/analytics/PaymentMethodsChart";
import { CustomMD3Theme } from "@constants/theme";
import { useGetDashboardQuery } from "@/stores/apiSlices/reportApi.slice";
import { useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import { Shop } from "@/stores/state.interface";
import { LoaderBasic } from "./ui/Loader";
import { convertHourForDisplay, convertPaymentAmount } from "@/constants/utils";

const { width } = Dimensions.get("window");

const ShopDashboard = () => {
  const theme = useTheme<CustomMD3Theme>();
  const { t } = useTranslation();

  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;
  const { data: dashboard, isLoading: dashboardLoading } = useGetDashboardQuery(
    {
      shopId: shop.id,
    },
  );

  const [activeTab, setActiveTab] = useState("sales");

  if (dashboardLoading) {
    return <LoaderBasic />;
  }

  if (!dashboard) {
    return;
  }

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
            {t("report_payment_method")}
          </Text>
        </TouchableOpacity>
      </Surface>
      <ScrollView
        style={{
          flex: 1,
          padding: 16,
        }}
      >
        {activeTab === "sales" && (
          <DailySalesChart width={width} data={dashboard.dailySalesReport} />
        )}
        {activeTab === "dishes" && (
          <PopularDishesChart
            width={width}
            data={dashboard.popularDishesReport}
          />
        )}
        {activeTab === "hourly" && (
          <HourlyDistributionChart
            width={width}
            data={dashboard.hourlySalesReport}
          />
        )}
        {activeTab === "payment" && (
          <PaymentMethodsChart
            width={width}
            data={dashboard.paymentMethodDistributionReport}
          />
        )}

        <View style={styles.summaryContainer}>
          <Surface
            style={[
              styles.summaryCard,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Text
              style={[styles.summaryTitle, { color: theme.colors.primary }]}
            >
              {t("total_revenue")}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: theme.colors.onPrimaryContainer },
              ]}
            >
              {convertPaymentAmount(dashboard.totalRevenue)}
            </Text>
            <Text
              style={[styles.summarySubtitle, { color: theme.colors.primary }]}
            >
              {t(`last_${dashboard.period}`)}
            </Text>
          </Surface>

          <Surface
            style={[
              styles.summaryCard,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
          >
            <Text
              style={[styles.summaryTitle, { color: theme.colors.secondary }]}
            >
              {t("report_order_count")}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: theme.colors.onSecondaryContainer },
              ]}
            >
              {dashboard.totalOrders}
            </Text>
            <Text
              style={[
                styles.summarySubtitle,
                { color: theme.colors.secondary },
              ]}
            >
              {t(`last_${dashboard.period}`)}
            </Text>
          </Surface>

          <Surface
            style={[
              styles.summaryCard,
              { backgroundColor: theme.colors.tertiaryContainer },
            ]}
          >
            <Text
              style={[styles.summaryTitle, { color: theme.colors.tertiary }]}
            >
              {t("avg_order_value")}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: theme.colors.onTertiaryContainer },
              ]}
            >
              {convertPaymentAmount(dashboard.averageRevenuePerOrder)}
            </Text>
            <Text
              style={[styles.summarySubtitle, { color: theme.colors.tertiary }]}
            >
              {t(`last_${dashboard.period}`)}
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
              {convertHourForDisplay(dashboard.peakHour?.hour)}
            </Text>
            <Text
              style={[styles.summarySubtitle, { color: theme.colors.yellow }]}
            >
              {`${convertPaymentAmount(dashboard.peakHour?.orders)} ${t("report_order")} - ${convertPaymentAmount(dashboard.peakHour?.revenue)}`}
            </Text>
          </Surface>
        </View>
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
