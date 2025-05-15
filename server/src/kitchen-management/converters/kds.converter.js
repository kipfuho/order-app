/* eslint-disable no-param-reassign */
const convertDishOrderForKitchenResponse = (dishOrder) => {
  delete dishOrder.price;
  delete dishOrder.isTaxIncludedPrice;
  delete dishOrder.taxIncludedPrice;
  delete dishOrder.beforeTaxTotalPrice;
  delete dishOrder.afterTaxTotalPrice;
  delete dishOrder.taxRate;
  delete dishOrder.taxAmount;
  delete dishOrder.beforeTaxTotalDiscountAmount;
  delete dishOrder.afterTaxTotalDiscountAmount;
  delete dishOrder.taxTotalDiscountAmount;
  delete dishOrder.paymentAmount;
  return dishOrder;
};
/* eslint-enable no-param-reassign */

module.exports = {
  convertDishOrderForKitchenResponse,
};
