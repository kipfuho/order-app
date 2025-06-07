const httpStatus = require('http-status');
const {
  setupCompleteShopData,
  getTableForOrder,
  createNewOrder,
  getTableActiveOrderSessions,
  getOrderSessionDetail,
} = require('../integration.util');
const { setupTestDB, getRequest } = require('../setup');

setupTestDB();
const request = getRequest();

describe('OrderManagement', () => {
  describe('Order không thuế', () => {
    it('Món không thuế - Thành công', async () => {
      const { token, dishes, shop } = await setupCompleteShopData();

      const tableForOrders = await getTableForOrder({ token, shop });
      expect(tableForOrders.length).toBeGreaterThan(0);
      const table = tableForOrders[0];

      await createNewOrder({
        token,
        shop,
        table,
        dishOrders: [
          {
            dishId: dishes[0].id,
            quantity: 10,
          },
        ],
      });

      const tableForOrdersAfterCreateOrder = await getTableForOrder({ token, shop });
      expect(tableForOrdersAfterCreateOrder.length).toBeGreaterThan(0);
      expect(tableForOrdersAfterCreateOrder[0].numberOfOrderSession).toBe(1);
      expect(tableForOrdersAfterCreateOrder[0].totalPaymentAmount).toBe(190000);
      const activeOrderSessions = await getTableActiveOrderSessions({
        token,
        shop,
        table,
      });
      expect(activeOrderSessions.length).toBe(1);
      const orderSession = activeOrderSessions[0];
      const orderSessionDetail = await getOrderSessionDetail({
        token,
        shop,
        orderSession,
      });
      expect(orderSessionDetail.paymentAmount).toBe(190000);
    });

    it('Món không thuế - Không thành công do bàn đã có khách', async () => {
      const { token, dishes, shop } = await setupCompleteShopData();

      const tableForOrders = await getTableForOrder({ token, shop });
      expect(tableForOrders.length).toBeGreaterThan(0);

      await createNewOrder({
        token,
        shop,
        table: tableForOrders[0],
        dishOrders: [
          {
            dishId: dishes[0].id,
            quantity: 10,
          },
        ],
      });

      await request
        .post(`/v1/shops/${shop.id}/orders/create-order`)
        .send({
          shopId: shop.id,
          tableId: tableForOrders[0].id,
          dishOrders: [
            {
              dishId: dishes[0].id,
              quantity: 10,
            },
          ],
        })
        .set({ Authorization: `Bearer ${token}` })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('Món không thuế - nhiều lượt order', async () => {
      const { token, dishes, shop } = await setupCompleteShopData();

      const tableForOrders = await getTableForOrder({ token, shop });
      expect(tableForOrders.length).toBeGreaterThan(0);
      const table = tableForOrders[0];

      await createNewOrder({
        token,
        shop,
        table,
        dishOrders: [
          {
            dishId: dishes[0].id,
            quantity: 1,
          },
        ],
      });

      const activeOrderSessions = await getTableActiveOrderSessions({
        token,
        shop,
        table,
      });
      const orderSession = activeOrderSessions[0];

      await createNewOrder({
        token,
        shop,
        table: tableForOrders[0],
        dishOrders: [
          {
            dishId: dishes[1].id,
            quantity: 2,
          },
        ],
        orderSession,
      });
      await createNewOrder({
        token,
        shop,
        table: tableForOrders[0],
        dishOrders: [
          {
            dishId: dishes[2].id,
            quantity: 3,
          },
        ],
        orderSession,
      });
      await createNewOrder({
        token,
        shop,
        table: tableForOrders[0],
        dishOrders: [
          {
            dishId: dishes[3].id,
            quantity: 4,
          },
        ],
        orderSession,
      });
      await createNewOrder({
        token,
        shop,
        table: tableForOrders[0],
        dishOrders: [
          {
            dishId: dishes[4].id,
            quantity: 5,
          },
        ],
        orderSession,
      });

      const tableForOrdersAfterCreateOrder = await getTableForOrder({ token, shop });
      expect(tableForOrdersAfterCreateOrder.length).toBeGreaterThan(0);
      expect(tableForOrdersAfterCreateOrder[0].numberOfOrderSession).toBe(1);
      expect(tableForOrdersAfterCreateOrder[0].totalPaymentAmount).toBe(685000);
      const activeOrderSessionsAfterCreateOrder = await getTableActiveOrderSessions({
        token,
        shop,
        table,
      });
      expect(activeOrderSessionsAfterCreateOrder.length).toBe(1);
      const orderSessionAfterCreateOrder = activeOrderSessions[0];
      const orderSessionDetail = await getOrderSessionDetail({
        token,
        shop,
        orderSession: orderSessionAfterCreateOrder,
      });
      expect(orderSessionDetail.paymentAmount).toBe(685000);
    });
  });
});
