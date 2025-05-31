import { ReportPeriod } from "@/constants/common";

interface GetDailySalesReportRequest {
  shopId: string;
  from?: Date;
  to?: Date;
  period?: ReportPeriod;
}

interface GetPopularDishesReportRequest {
  shopId: string;
  from?: Date;
  to?: Date;
  period?: ReportPeriod;
}

interface GetPaymentMethodDistributionReportRequest {
  shopId: string;
  from?: Date;
  to?: Date;
  period?: ReportPeriod;
}

interface GetHourlySalesReportRequest {
  shopId: string;
  from?: Date;
  to?: Date;
  period?: ReportPeriod;
}

interface GetDashboardRequest {
  shopId: string;
  from?: Date;
  to?: Date;
  period?: ReportPeriod;
}

export {
  GetDailySalesReportRequest,
  GetPopularDishesReportRequest,
  GetPaymentMethodDistributionReportRequest,
  GetHourlySalesReportRequest,
  GetDashboardRequest,
};
