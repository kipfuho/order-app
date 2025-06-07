const httpStatus = require('http-status');
const { getRequest } = require('./setup');
const {
  getUserData,
  getShopData,
  getDishData,
  getDishCategoryData,
  getTablePositionData,
  getTableData,
} = require('./testData');

const request = getRequest();

const createShopOwnerAndGetAccessToken = async () => {
  const payload = getUserData()[0];
  await request.post('/v1/auth/register').send(payload).expect(httpStatus.CREATED);
  const result = await request
    .post('/v1/auth/login')
    .send({
      email: payload.email,
      password: payload.password,
    })
    .expect(httpStatus.OK);
  return result.body;
};

const createShop = async ({ token, taxRate = 0 }) => {
  const payload = getShopData({ taxRate })[0];
  const result = await request
    .post(`/v1/shops`)
    .send(payload)
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.CREATED);
  return result.body;
};

const createDishCategory = async ({ token, shop, dishCategoryData }) => {
  if (!dishCategoryData) {
    const payload = getDishCategoryData()[0];
    const result = await request
      .post(`/v1/shops/${shop.id}/dishCategories`)
      .send(payload)
      .set({ Authorization: `Bearer ${token}` })
      .expect(httpStatus.CREATED);
    return result.body;
  }

  const result = await request
    .post(`/v1/shops/${shop.id}/dishCategories`)
    .send(dishCategoryData)
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.CREATED);
  return result.body;
};

const createDish = async ({ token, shop, dishCategory, unit, dishData }) => {
  if (!dishData) {
    const payload = getDishData()[0];
    const result = await request
      .post(`/v1/shops/${shop.id}/dishes`)
      .send({ ...payload, categoryId: dishCategory.id, unitId: unit.id })
      .set({ Authorization: `Bearer ${token}` })
      .expect(httpStatus.CREATED);
    return result.body;
  }

  const result = await request
    .post(`/v1/shops/${shop.id}/dishes`)
    .send({ ...dishData, categoryId: dishCategory.id, unitId: unit.id })
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.CREATED);
  return result.body;
};

const createTablePosition = async ({ token, shop, dishCategories, tablePositionData }) => {
  if (!tablePositionData) {
    const payload = getTablePositionData()[0];
    const result = await request
      .post(`/v1/shops/${shop.id}/tablePositions`)
      .send({ ...payload, dishCategories: dishCategories.map((dc) => dc.id) })
      .set({ Authorization: `Bearer ${token}` })
      .expect(httpStatus.CREATED);
    return result.body;
  }

  const result = await request
    .post(`/v1/shops/${shop.id}/tablePositions`)
    .send({ ...tablePositionData, dishCategories: dishCategories.map((dc) => dc.id) })
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.CREATED);
  return result.body;
};

const createTable = async ({ token, shop, tablePosition, tableData }) => {
  if (!tableData) {
    const payload = getTableData()[0];
    const result = await request
      .post(`/v1/shops/${shop.id}/tables`)
      .send({ ...payload, position: tablePosition.id })
      .set({ Authorization: `Bearer ${token}` })
      .expect(httpStatus.CREATED);
    return result.body;
  }

  const result = await request
    .post(`/v1/shops/${shop.id}/tables`)
    .send({ ...tableData, position: tablePosition.id })
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.CREATED);
  return result.body;
};

const queryShop = async ({ token }) => {
  const result = await request
    .get(`/v1/shops`)
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body.results;
};

const getDishCategories = async ({ token, shop }) => {
  const result = await request
    .get(`/v1/shops/${shop.id}/dishCategories`)
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body.dishCategories;
};

const getDishes = async ({ token, shop }) => {
  const result = await request
    .get(`/v1/shops/${shop.id}/dishes`)
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body.dishes;
};

const getUnits = async ({ token, shop }) => {
  const result = await request
    .get(`/v1/shops/${shop.id}/units`)
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body.units;
};

const getTablePositions = async ({ token, shop }) => {
  const result = await request
    .get(`/v1/shops/${shop.id}/tablePositions`)
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body.tablePositions;
};

const getTables = async ({ token, shop }) => {
  const result = await request
    .get(`/v1/shops/${shop.id}/tables`)
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body.tables;
};

const setupCompleteShopData = async () => {
  const { tokens } = await createShopOwnerAndGetAccessToken();
  const { token } = tokens.access;

  await createShop({ token });
  const shops = await queryShop({ token });
  const shop = shops[0];
  await createDishCategory({ token, shop });
  const dishCategories = await getDishCategories({ token, shop });
  const units = await getUnits({ token, shop });
  await createDish({ token, shop, dishCategory: dishCategories[0], unit: units[0], dishData: getDishData()[0] });
  await createDish({ token, shop, dishCategory: dishCategories[0], unit: units[0], dishData: getDishData()[1] });
  await createDish({ token, shop, dishCategory: dishCategories[0], unit: units[0], dishData: getDishData()[2] });
  await createDish({ token, shop, dishCategory: dishCategories[0], unit: units[0], dishData: getDishData()[3] });
  await createDish({ token, shop, dishCategory: dishCategories[0], unit: units[0], dishData: getDishData()[4] });
  const dishes = await getDishes({ token, shop });
  await createTablePosition({
    token,
    shop,
    dishCategories,
  });
  const tablePositions = await getTablePositions({ token, shop });
  await createTable({
    token,
    shop,
    tablePosition: tablePositions[0],
  });
  const tables = await getTables({ token, shop });

  return { token, shop, dishCategories, dishes, units, tablePositions, tables };
};

const getTableForOrder = async ({ token, shop }) => {
  const result = await request
    .post(`/v1/shops/${shop.id}/orders/get-table-for-orders`)
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body.tables;
};

const createNewOrder = async ({ token, shop, table, dishOrders, orderSession }) => {
  const result = await request
    .post(`/v1/shops/${shop.id}/orders/create-order`)
    .send({ shopId: shop.id, tableId: table.id, dishOrders, ...(orderSession ? { orderSessionId: orderSession.id } : null) })
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body;
};

const getTableActiveOrderSessions = async ({ token, shop, table }) => {
  const result = await request
    .post(`/v1/shops/${shop.id}/orders/get-active-ordersessions`)
    .send({ shopId: shop.id, tableId: table.id })
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body.orderSessions;
};

const getOrderSessionDetail = async ({ token, shop, orderSession }) => {
  const result = await request
    .post(`/v1/shops/${shop.id}/orders/get-ordersession-detail`)
    .send({ shopId: shop.id, orderSessionId: orderSession.id })
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body.orderSession;
};

const payOrderSession = async ({ token, shop, orderSession, paymentDetails }) => {
  const result = await request
    .post(`/v1/shops/${shop.id}/orders/pay-ordersession`)
    .send({ orderSessionId: orderSession.id, paymentDetails })
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body;
};

const cancelOrderSession = async ({ token, shop, orderSession, reason }) => {
  const result = await request
    .post(`/v1/shops/${shop.id}/cancel-ordersession/cancel-ordersession`)
    .send({ orderSessionId: orderSession.id, reason })
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body;
};

const cancelOrderSessionPaidStatus = async ({ token, shop, orderSession }) => {
  const result = await request
    .post(`/v1/shops/${shop.id}/orders/cancel-ordersession-paid-status`)
    .send({ orderSessionId: orderSession.id })
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body;
};

const discountOrderSession = async ({
  token,
  shop,
  orderSession,
  discountReason,
  discountValue,
  discountType,
  discountAfterTax,
}) => {
  const result = await request
    .post(`/v1/shops/${shop.id}/orders/discount-ordersession`)
    .send({ orderSession: orderSession.id, discountReason, discountValue, discountType, discountAfterTax })
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body;
};

const discountDishOrder = async ({
  token,
  shop,
  orderSession,
  dishOrderId,
  orderId,
  discountReason,
  discountValue,
  discountType,
}) => {
  const result = await request
    .post(`/v1/shops/${shop.id}/orders/discount-dishorder`)
    .send({ orderSessionId: orderSession.id, dishOrderId, orderId, discountReason, discountValue, discountType })
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body;
};

const removeDiscountFromOrderSession = async ({ token, shop, orderSession, discountId }) => {
  const result = await request
    .post(`/v1/shops/${shop.id}/orders/remove-discount`)
    .send({ orderSessionId: orderSession.id, discountId })
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body;
};

const getOrderSessionHistory = async ({ token, shop }) => {
  const result = await request
    .post(`/v1/shops/${shop.id}/orders/get-ordersession-history`)
    .set({ Authorization: `Bearer ${token}` })
    .expect(httpStatus.OK);
  return result.body;
};

module.exports = {
  createShopOwnerAndGetAccessToken,
  createShop,
  createDishCategory,
  createDish,
  createTablePosition,
  createTable,
  queryShop,
  getDishCategories,
  getDishes,
  getUnits,
  getTablePositions,
  getTables,
  setupCompleteShopData,
  getTableForOrder,
  createNewOrder,
  getTableActiveOrderSessions,
  getOrderSessionDetail,
  payOrderSession,
  cancelOrderSession,
  cancelOrderSessionPaidStatus,
  discountOrderSession,
  discountDishOrder,
  removeDiscountFromOrderSession,
  getOrderSessionHistory,
};
