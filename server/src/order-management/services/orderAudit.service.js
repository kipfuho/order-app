const _ = require('lodash');
const redisClient = require('../../utils/redis');
const { getRoundDiscountAmount, getRoundPaymentAmount } = require('../../utils/common');
const { bulkUpdate, PostgreSQLTable } = require('../../utils/prisma');
const { OrderSession } = require('../../models');

const updateFullOrderSession = async ({ orderSessionId, orderSession, orderSessionDetail }) => {
  const key = `update_full_order_session_${orderSessionId}`;
  const canGetLock = await redisClient.getCloudLock({ key, periodInSecond: 10 });
  // TODO: can cause bug
  if (!canGetLock) return;

  try {
    // only try to update orders and dishorders in certain cases
    if (
      (orderSessionDetail.shouldRecalculateTax && orderSession.totalTaxAmount !== orderSessionDetail.totalTaxAmount) ||
      orderSession.beforeTaxTotalDiscountAmount !== orderSessionDetail.beforeTaxTotalDiscountAmounts
    ) {
      const discountPercent = Math.min(
        orderSessionDetail.beforeTaxTotalDiscountAmount / orderSessionDetail.pretaxPaymentAmount,
        1
      );

      /* eslint-disable no-param-reassign */
      orderSessionDetail.orders.forEach((order) => {
        order.dishOrders.forEach((dishOrder) => {
          dishOrder.beforeTaxTotalDiscountAmount = getRoundDiscountAmount(dishOrder.beforeTaxTotalPrice * discountPercent);
          dishOrder.afterTaxTotalDiscountAmount = getRoundDiscountAmount(dishOrder.afterTaxTotalPrice * discountPercent);
          dishOrder.revenueAmount = getRoundPaymentAmount(
            dishOrder.beforeTaxTotalPrice - dishOrder.beforeTaxTotalDiscountAmount
          );
          dishOrder.paymentAmount = getRoundPaymentAmount(
            dishOrder.afterTaxTotalPrice - dishOrder.afterTaxTotalDiscountAmount
          );
        });
      });
      /* eslint-enable no-param-reassign */

      // track what's changed and update only that
      const orderSessionLastAuditTime = orderSessionDetail.auditedAt;
      const isOrderSessionUpdate = orderSessionDetail.updatedAt > orderSessionDetail.auditedAt;
      const allOrders = orderSessionDetail.orders.filter(
        (order) => isOrderSessionUpdate || order.updatedAt > orderSessionLastAuditTime
      );
      const allDishOrders = allOrders.flatMap((order) => order.dishOrders);
      await Promise.all([
        bulkUpdate(
          PostgreSQLTable.DishOrder,
          allDishOrders.map((dishOrder) => ({
            id: dishOrder.id,
            beforeTaxTotalDiscountAmount: dishOrder.beforeTaxTotalDiscountAmount,
            afterTaxTotalDiscountAmount: dishOrder.afterTaxTotalDiscountAmount,
            taxIncludedPrice: dishOrder.taxIncludedPrice,
            afterTaxTotalPrice: dishOrder.afterTaxTotalPrice,
            revenueAmount: dishOrder.revenueAmount,
            paymentAmount: dishOrder.paymentAmount,
          })),
          bulkUpdate(
            PostgreSQLTable.Order,
            allOrders.map((order) => ({
              id: order.id,
              totalQuantity: _.sumBy(order.dishOrders, 'quantity') || 0,
              totalBeforeTaxAmount: getRoundPaymentAmount(_.sumBy(order.dishOrders, 'beforeTaxTotalPrice') || 0),
              totalAfterTaxAmount: getRoundPaymentAmount(_.sumBy(order.dishOrders, 'afterTaxTotalPrice') || 0),
              beforeTaxTotalDiscountAmount: getRoundDiscountAmount(
                _.sumBy(order.dishOrders, 'beforeTaxTotalDiscountAmount') || 0
              ),
              afterTaxTotalDiscountAmount: getRoundDiscountAmount(
                _.sumBy(order.dishOrders, 'afterTaxTotalDiscountAmount') || 0
              ),
              revenueAmount: getRoundPaymentAmount(_.sumBy(order.dishOrders, 'revenueAmount') || 0),
              paymentAmount: getRoundPaymentAmount(_.sumBy(order.dishOrders, 'paymentAmount') || 0),
            }))
          )
        ),
      ]);
    }
    if (!_.isEmpty(orderSessionDetail.discounts)) {
      await bulkUpdate(
        PostgreSQLTable.Discount,
        orderSessionDetail.discounts.map((discount) => ({
          id: discount.id,
          beforeTaxTotalDiscountAmount: discount.beforeTaxTotalDiscountAmount,
          afterTaxTotalDiscountAmount: discount.afterTaxTotalDiscountAmount,
          taxTotalDiscountAmount: discount.taxTotalDiscountAmount,
        }))
      );
    }
    const currentTime = new Date();
    await OrderSession.update({
      data: {
        shouldRecalculateTax: false,
        pretaxPaymentAmount: orderSessionDetail.pretaxPaymentAmount,
        revenueAmount: orderSessionDetail.revenueAmount,
        paymentAmount: orderSessionDetail.paymentAmount,
        beforeTaxTotalDiscountAmount: orderSessionDetail.beforeTaxTotalDiscountAmount,
        afterTaxTotalDiscountAmount: orderSessionDetail.afterTaxTotalDiscountAmount,
        totalTaxAmount: orderSessionDetail.totalTaxAmount,
        taxDetails: {
          deleteMany: {},
          createMany: {
            data: orderSessionDetail.taxDetails,
          },
        },
        updatedAt: currentTime,
        auditedAt: currentTime,
      },
      where: { id: orderSessionId },
      select: {
        id: true,
      },
    });
  } finally {
    redisClient.deleteKey(key);
  }
};

module.exports = {
  updateFullOrderSession,
};
