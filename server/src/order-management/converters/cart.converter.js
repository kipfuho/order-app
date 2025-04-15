/* eslint-disable no-param-reassign */
const convertCartForResponse = (cart) => {
  delete cart.createdAt;
  delete cart.updatedAt;
  delete cart.status;
  return cart;
};
/* eslint-enable no-param-reassign */

module.exports = {
  convertCartForResponse,
};
