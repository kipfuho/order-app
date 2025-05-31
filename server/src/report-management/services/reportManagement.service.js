const _ = require('lodash');
const moment = require('moment-timezone');
const { getShopTimeZone } = require('../../middlewares/clsHooked');
const { OrderSession, Order } = require('../../models');
const {
  createSearchByDateOptionWithShopTimezone,
  getReportPeriod,
  divideToNPart,
  getRoundPaymentAmount,
} = require('../../utils/common');
const { OrderSessionStatus, Status, ReportPeriod } = require('../../utils/constant');

const _getTimeFilterForReport = ({ from, to, period }) => {
  const timezone = getShopTimeZone();
  if (!from) {
    const days = getReportPeriod(period);
    // eslint-disable-next-line no-param-reassign
    from = moment()
      .tz(timezone)
      .startOf('day')
      .subtract(days - 1, 'days')
      .toDate();
  }
  const timeFilter = createSearchByDateOptionWithShopTimezone({
    from,
    to,
    filterKey: 'createdAt',
  });

  return timeFilter;
};

const _getOrderForReport = async ({ from, to, period, shopId, projections }) => {
  const timeFilter = _getTimeFilterForReport({ from, to, period });

  const orders = await Order.findMany({
    where: _.pickBy({
      shopId,
      orderSessionStatus: OrderSessionStatus.paid,
      status: { not: Status.disabled },
      ...timeFilter,
    }),
    select: projections,
  });

  return orders;
};

const _getOrderSessionForReport = async ({ from, to, shopId, period, projections }) => {
  const timeFilter = _getTimeFilterForReport({ from, to, period });

  const orderSessions = await OrderSession.findMany({
    where: _.pickBy({
      shopId,
      ...timeFilter,
      status: OrderSessionStatus.paid,
    }),
    select: projections,
  });

  return orderSessions;
};

const getDailySalesReport = async ({ orderSessions, shopId, period, from, to }) => {
  if (!orderSessions) {
    // eslint-disable-next-line no-param-reassign
    orderSessions = await _getOrderSessionForReport({
      shopId,
      period,
      from,
      to,
      projections: {
        createdAt: true,
        revenueAmount: true,
      },
    });
  }

  const saleByDate = {};

  const timezone = getShopTimeZone();
  (orderSessions || []).forEach((orderSession) => {
    const dateKey = moment(orderSession.createdAt).tz(timezone).format('DD-MM-YYYY');
    if (!saleByDate[dateKey]) {
      saleByDate[dateKey] = {
        date: dateKey,
        orders: 0,
        revenue: 0,
      };
    }

    saleByDate[dateKey].orders += 1;
    saleByDate[dateKey].revenue += orderSession.revenueAmount || 0;
  });

  return Object.values(saleByDate);
};

const getPopularDishesReport = async ({ orders, shopId, from, to, period }) => {
  if (!orders) {
    // eslint-disable-next-line no-param-reassign
    orders = await _getOrderForReport({
      from,
      to,
      period,
      shopId,
      projections: {
        createdAt: true,
        dishOrders: {
          select: {
            dishId: true,
            name: true,
            quantity: true,
            price: true,
            beforeTaxTotalDiscountAmount: true,
          },
        },
      },
    });
  }

  const dishSoldById = {};

  (orders || []).forEach((order) => {
    order.dishOrders.forEach((dishOrder) => {
      if (!dishSoldById[dishOrder.dishId]) {
        dishSoldById[dishOrder.dishId] = {
          name: dishOrder.name,
          quantity: 0,
          revenue: 0,
        };
      }
      dishSoldById[dishOrder.dishId].quantity += dishOrder.quantity;
      dishSoldById[dishOrder.dishId].revenue +=
        dishOrder.price * dishOrder.quantity - (dishOrder.beforeTaxTotalDiscountAmount || 0);
    });
  });

  return Object.values(dishSoldById);
};

const getPaymentMethodDistributionReport = async ({ orderSessions, shopId, from, to, period }) => {
  if (!orderSessions) {
    // eslint-disable-next-line no-param-reassign
    orderSessions = await _getOrderSessionForReport({
      from,
      to,
      period,
      shopId,
      projections: {
        paymentDetails: true,
        revenueAmount: true,
        paymentAmount: true,
      },
    });
  }

  const totalRevenueByPaymentMethod = {};

  (orderSessions || []).forEach((orderSession) => {
    const orderSessionRevenueRatio = orderSession.revenueAmount / orderSession.paymentAmount;
    (orderSession.paymentDetails || []).forEach((paymentDetail) => {
      if (!totalRevenueByPaymentMethod[paymentDetail.paymentMethod]) {
        totalRevenueByPaymentMethod[paymentDetail.paymentMethod] = {
          paymentMethod: paymentDetail.paymentMethod,
          revenue: 0,
        };
      }

      totalRevenueByPaymentMethod[paymentDetail.paymentMethod].revenue +=
        orderSessionRevenueRatio * paymentDetail.paymentAmount;
    });
  });

  const paymentMethodDistribution = divideToNPart({
    initialSum: 100,
    parts: Object.values(totalRevenueByPaymentMethod).map((revenueByPaymentMethod) => revenueByPaymentMethod.revenue),
    precision: 1,
  });

  return Object.values(totalRevenueByPaymentMethod).map((revenueByPaymentMethod, index) => ({
    paymentMethod: revenueByPaymentMethod.paymentMethod,
    percentage: paymentMethodDistribution[index],
  }));
};

const getHourlySalesReport = async ({ orderSessions, shopId, from, to, period }) => {
  if (!orderSessions) {
    // eslint-disable-next-line no-param-reassign
    orderSessions = await _getOrderSessionForReport({
      from,
      to,
      period,
      shopId,
      projections: {
        createdAt: true,
        revenueAmount: true,
      },
    });
  }

  const hourlySaleReport = {};
  for (let h = 0; h < 24; h += 1) {
    hourlySaleReport[h] = {
      hour: h,
      orders: 0,
      revenue: 0,
    };
  }

  const timezone = getShopTimeZone();
  (orderSessions || []).forEach((orderSession) => {
    const hour = moment(orderSession.createdAt).tz(timezone).hour();

    hourlySaleReport[hour].orders += 1;
    hourlySaleReport[hour].revenue += orderSession.revenueAmount || 0;
  });

  return Object.values(hourlySaleReport);
};

const getDashboard = async ({ shopId, from, to, period }) => {
  if (!period) {
    // eslint-disable-next-line no-param-reassign
    period = ReportPeriod.DAY;
  }
  const orderSessions = await _getOrderSessionForReport({
    from,
    to,
    period,
    shopId,
    projections: { createdAt: true, revenueAmount: true, paymentDetails: true, paymentAmount: true },
  });
  const orders = await _getOrderSessionForReport({
    from,
    to,
    period,
    shopId,
    projections: {
      createdAt: true,
      dishOrders: {
        select: {
          dishId: true,
          name: true,
          quantity: true,
          price: true,
          beforeTaxTotalDiscountAmount: true,
        },
      },
    },
  });

  const allReports = await Promise.all([
    getDailySalesReport({
      orderSessions,
    }),
    getPopularDishesReport({
      orders,
    }),
    getPaymentMethodDistributionReport({
      orderSessions,
    }),
    getHourlySalesReport({
      orderSessions,
    }),
  ]);
  const dailySalesReport = allReports[0];
  const popularDishesReport = allReports[1];
  const paymentMethodDistributionReport = allReports[2];
  const hourlySalesReport = allReports[3];

  const totalOrders = orderSessions.length;
  const totalRevenue = _.sumBy(orderSessions, 'revenueAmount') || 0;
  const peakHour = _.maxBy(hourlySalesReport, 'revenue');

  return {
    from,
    to,
    period,
    totalOrders,
    totalRevenue,
    averageRevenuePerOrder: getRoundPaymentAmount(totalRevenue / totalOrders),
    peakHour,
    dailySalesReport,
    popularDishesReport,
    paymentMethodDistributionReport,
    hourlySalesReport,
  };
};

module.exports = {
  getDailySalesReport,
  getPopularDishesReport,
  getPaymentMethodDistributionReport,
  getHourlySalesReport,
  getDashboard,
};
