const _ = require('lodash');
const moment = require('moment-timezone');
const { getShopTimeZone } = require('../../middlewares/clsHooked');
const { OrderSession, Order } = require('../../models');
const { createSearchByDateOptionWithShopTimezone, getReportPeriod } = require('../../utils/common');
const { OrderSessionStatus, Status } = require('../../utils/constant');

const getDailySalesReport = async ({ shopId, period, from, to }) => {
  const days = getReportPeriod(period);
  const timezone = getShopTimeZone();
  if (!from) {
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

  const sessions = await OrderSession.findMany({
    where: _.pickBy({
      shopId,
      ...timeFilter,
      status: OrderSessionStatus.paid,
    }),
    select: {
      createdAt: true,
      paymentAmount: true,
    },
  });

  const saleByDate = {};

  (sessions || []).forEach((session) => {
    const dateKey = moment(session.createdAt).tz(timezone).format('DD-MM-YYYY');
    if (!saleByDate[dateKey]) {
      saleByDate[dateKey] = {
        date: dateKey,
        orders: 0,
        revenue: 0,
      };
    }

    saleByDate[dateKey].orders += 1;
    saleByDate[dateKey].revenue += session.paymentAmount || 0;
  });

  return Object.values(saleByDate);
};

const getPopularDishesReport = async ({ shopId, from, to, period }) => {
  const days = getReportPeriod(period);
  const timezone = getShopTimeZone();
  if (!from) {
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
          paymentAmount: true,
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
      dishSoldById[dishOrder.dishId].revenue += dishOrder.paymentAmount || 0;
    });
  });

  return Object.values(dishSoldById);
};

const getPaymentMethodReport = async () => {
  const report = {};
  return report;
};

const getHourlyReport = async () => {
  const report = {};
  return report;
};

module.exports = {
  getDailySalesReport,
  getPopularDishesReport,
  getPaymentMethodReport,
  getHourlyReport,
};
