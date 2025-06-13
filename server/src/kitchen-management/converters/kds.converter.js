const { formatDateHHMMDDMMYYYY } = require('../../utils/common');

/* eslint-disable no-param-reassign */
const convertDishOrderForKitchenResponse = (dishOrder) => {
  dishOrder.createdAt = formatDateHHMMDDMMYYYY(dishOrder.createdAt);

  delete dishOrder.price;
  delete dishOrder.isTaxIncludedPrice;
  delete dishOrder.taxIncludedPrice;
  delete dishOrder.beforeTaxTotalPrice;
  delete dishOrder.afterTaxTotalPrice;
  delete dishOrder.taxRate;
  delete dishOrder.beforeTaxTotalDiscountAmount;
  delete dishOrder.afterTaxTotalDiscountAmount;
  delete dishOrder.taxTotalDiscountAmount;
  delete dishOrder.revenueAmount;
  delete dishOrder.paymentAmount;
  return dishOrder;
};
/* eslint-enable no-param-reassign */

const convertKitchenLogForResponse = (kitchenLog) => {
  // eslint-disable-next-line no-param-reassign
  kitchenLog.createdAt = formatDateHHMMDDMMYYYY(kitchenLog.createdAt);
  // eslint-disable-next-line no-param-reassign
  delete kitchenLog.updatedAt;

  return kitchenLog;
};

module.exports = {
  convertDishOrderForKitchenResponse,
  convertKitchenLogForResponse,
};
