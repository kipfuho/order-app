const _ = require('lodash');
const moment = require('moment-timezone');
const { getShopTimeZone } = require('../../middlewares/clsHooked');
const { OrderSession, Order } = require('../../models');
const { createSearchByDateOptionWithShopTimezone, getReportPeriod, divideToNPart } = require('../../utils/common');
const { OrderSessionStatus, Status } = require('../../utils/constant');

const getDailySalesReport = async ({ shopId, period, from, to }) => {
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

  const orderSessions = await OrderSession.findMany({
    where: _.pickBy({
      shopId,
      ...timeFilter,
      status: OrderSessionStatus.paid,
    }),
    select: {
      createdAt: true,
      revenueAmount: true,
    },
  });

  const saleByDate = {};

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

const getPopularDishesReport = async ({ shopId, from, to, period }) => {
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

  const orders = await Order.findMany({
    where: _.pickBy({
      shopId,
      orderSessionStatus: OrderSessionStatus.paid,
      status: { not: Status.disabled },
      ...timeFilter,
    }),
    select: {
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

const getPaymentMethodReport = async ({ shopId, from, to, period }) => {
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

  const orderSessions = await OrderSession.findMany({
    where: _.pickBy({
      shopId,
      ...timeFilter,
      status: OrderSessionStatus.paid,
    }),
    select: {
      paymentDetails: true,
      revenueAmount: true,
      paymentAmount: true,
    },
  });

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

const getHourlyReport = async ({ shopId, from, to, period }) => {
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

  const orderSessions = await OrderSession.findMany({
    where: _.pickBy({
      shopId,
      ...timeFilter,
      status: OrderSessionStatus.paid,
    }),
    select: {
      createdAt: true,
      revenueAmount: true,
    },
  });

  const hourlySaleReport = {};
  for (let h = 0; h < 24; h += 1) {
    hourlySaleReport[h] = {
      hour: h,
      orders: 0,
      revenue: 0,
    };
  }

  (orderSessions || []).forEach((orderSession) => {
    const hour = moment(orderSession.createdAt).tz(timezone).hour();

    hourlySaleReport[hour].orders += 1;
    hourlySaleReport[hour].revenue += orderSession.revenueAmount || 0;
  });

  return Object.values(hourlySaleReport);
};

module.exports = {
  getDailySalesReport,
  getPopularDishesReport,
  getPaymentMethodReport,
  getHourlyReport,
};
