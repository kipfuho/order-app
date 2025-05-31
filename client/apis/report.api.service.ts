import {
  DailySalesReportItem,
  HourlySalesReportItem,
  PaymentMethodDistributionReportItem,
  PopularDishesReportItem,
  ReportDashboard,
} from "@/stores/state.interface";
import { apiRequest } from "./api.service";
import { getAccessTokenLazily } from "./auth.api.service";
import {
  GetDailySalesReportRequest,
  GetDashboardRequest,
  GetHourlySalesReportRequest,
  GetPaymentMethodDistributionReportRequest,
  GetPopularDishesReportRequest,
} from "./report.api.interface";

const getDailySalesReportRequest = async ({
  shopId,
  from,
  to,
  period,
}: GetDailySalesReportRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: { dailySalesReport: DailySalesReportItem[] } = await apiRequest(
    {
      method: "POST",
      endpoint: `/v1/shops/${shopId}/report-management/daily-sales`,
      token: accessToken,
      data: {
        from,
        to,
        period,
      },
    },
  );

  return result.dailySalesReport;
};

const getPopularDishesReportRequest = async ({
  shopId,
  from,
  to,
  period,
}: GetPopularDishesReportRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: { popularDishesReport: PopularDishesReportItem[] } =
    await apiRequest({
      method: "POST",
      endpoint: `/v1/shops/${shopId}/report-management/popular-dishes`,
      token: accessToken,
      data: {
        from,
        to,
        period,
      },
    });

  return result.popularDishesReport;
};

const getPaymentMethodDistributionReportRequest = async ({
  shopId,
  from,
  to,
  period,
}: GetPaymentMethodDistributionReportRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    paymentMethodDistributionReport: PaymentMethodDistributionReportItem[];
  } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/report-management/payment-method-distribution`,
    token: accessToken,
    data: {
      from,
      to,
      period,
    },
  });

  return result.paymentMethodDistributionReport;
};

const getHourlySalesReportRequest = async ({
  shopId,
  from,
  to,
  period,
}: GetHourlySalesReportRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    hourlySalesReport: HourlySalesReportItem[];
  } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/report-management/hourly-sales`,
    token: accessToken,
    data: {
      from,
      to,
      period,
    },
  });

  return result.hourlySalesReport;
};

const getDashboardRequest = async ({
  shopId,
  from,
  to,
  period,
}: GetDashboardRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    dashboard: ReportDashboard;
  } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/report-management/dashboard`,
    token: accessToken,
    data: {
      from,
      to,
      period,
    },
  });

  return result.dashboard;
};

export {
  getDailySalesReportRequest,
  getPopularDishesReportRequest,
  getPaymentMethodDistributionReportRequest,
  getHourlySalesReportRequest,
  getDashboardRequest,
};
