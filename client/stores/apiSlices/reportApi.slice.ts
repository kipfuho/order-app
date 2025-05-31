import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  DailySalesReportItem,
  HourlySalesReportItem,
  PaymentMethodDistributionReportItem,
  PopularDishesReportItem,
  ReportDashboard,
} from "../state.interface";
import { API_BASE_URL } from "@apis/api.service";
import {
  getDailySalesReportRequest,
  getDashboardRequest,
  getHourlySalesReportRequest,
  getPaymentMethodDistributionReportRequest,
  getPopularDishesReportRequest,
} from "@/apis/report.api.service";
import {
  GetDailySalesReportRequest,
  GetDashboardRequest,
  GetHourlySalesReportRequest,
  GetPaymentMethodDistributionReportRequest,
  GetPopularDishesReportRequest,
} from "@/apis/report.api.interface";
import { ReportPeriod } from "@/constants/common";

export const reportApiSlice = createApi({
  reducerPath: "reportApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Reports"],
  // keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    getDailySalesReport: builder.query<
      DailySalesReportItem[],
      GetDailySalesReportRequest
    >({
      queryFn: async ({ shopId, from, to, period = ReportPeriod.MONTH }) => {
        try {
          const dailySalesReport = await getDailySalesReportRequest({
            shopId,
            from,
            to,
            period,
          });

          return { data: dailySalesReport };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Reports"], // Enables cache invalidation
    }),

    getPopularDishesReport: builder.query<
      PopularDishesReportItem[],
      GetPopularDishesReportRequest
    >({
      queryFn: async ({ shopId, from, to, period = ReportPeriod.MONTH }) => {
        try {
          const getPopularDishesReport = await getPopularDishesReportRequest({
            shopId,
            from,
            to,
            period,
          });

          return { data: getPopularDishesReport };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Reports"], // Enables cache invalidation
    }),

    getPaymentMethodDistributionReport: builder.query<
      PaymentMethodDistributionReportItem[],
      GetPaymentMethodDistributionReportRequest
    >({
      queryFn: async ({ shopId, from, to, period = ReportPeriod.MONTH }) => {
        try {
          const getPaymentMethodDistributionReport =
            await getPaymentMethodDistributionReportRequest({
              shopId,
              from,
              to,
              period,
            });

          return { data: getPaymentMethodDistributionReport };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Reports"], // Enables cache invalidation
    }),

    getHourlySalesReport: builder.query<
      HourlySalesReportItem[],
      GetHourlySalesReportRequest
    >({
      queryFn: async ({ shopId, from, to, period = ReportPeriod.MONTH }) => {
        try {
          const getHourlySalesReport = await getHourlySalesReportRequest({
            shopId,
            from,
            to,
            period,
          });

          return { data: getHourlySalesReport };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Reports"], // Enables cache invalidation
    }),

    getDashboard: builder.query<ReportDashboard, GetDashboardRequest>({
      queryFn: async ({ shopId, from, to, period = ReportPeriod.MONTH }) => {
        try {
          const dashboard = await getDashboardRequest({
            shopId,
            from,
            to,
            period,
          });

          return { data: dashboard };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Reports"], // Enables cache invalidation
    }),
  }),
});

export const {
  useGetDailySalesReportQuery,
  useGetPopularDishesReportQuery,
  useGetPaymentMethodDistributionReportQuery,
  useGetHourlySalesReportQuery,
  useGetDashboardQuery,
} = reportApiSlice;
