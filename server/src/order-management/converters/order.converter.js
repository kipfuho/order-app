const _ = require('lodash');

/* eslint-disable no-param-reassign */
const convertDishOrderForResponse = (dishOrder) => {
  // Neu la mon thuong
  if (_.get(dishOrder, 'dish.id')) {
    dishOrder.name = dishOrder.dish.name;
    // eslint-disable-next-line no-param-reassign
    dishOrder.images = dishOrder.dish.images;
    // eslint-disable-next-line no-param-reassign
    dishOrder.dishId = dishOrder.dish.id;
  } else {
    // Neu la mon khac
    dishOrder.name = _.get(dishOrder, 'name');
  }

  dishOrder.price = _.round(dishOrder.price);
  dishOrder.totalPrice = _.round(dishOrder.totalPrice);
};
/* eslint-enable no-param-reassign */

const convertOrderForResponse = (order) => {
  return {
    orderId: order.id,
    dishOrders: _.map(order.dishOrders, convertDishOrderForResponse),
  };
};

module.exports = {
  convertOrderForResponse,
};
