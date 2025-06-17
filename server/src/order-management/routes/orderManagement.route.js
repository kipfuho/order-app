const express = require('express');
const orderManagementController = require('../controllers/orderManagement.controller');
const auth = require('../../middlewares/auth');
const { PermissionType } = require('../../utils/constant');

const router = express.Router();

// shop app for employee and owner
router.post(
  '/create-order',
  auth(PermissionType.SHOP_APP, PermissionType.CREATE_ORDER),
  orderManagementController.createOrder
);
router.post(
  '/change-dish-quantity',
  auth(PermissionType.SHOP_APP, PermissionType.CHANGE_DISH_ORDER),
  orderManagementController.changeDishQuantity
);
router.post(
  '/update-order',
  auth(PermissionType.SHOP_APP, PermissionType.UPDATE_ORDER),
  orderManagementController.updateOrder
);
router.post(
  '/get-table-for-orders',
  auth(PermissionType.SHOP_APP, PermissionType.VIEW_ORDER),
  orderManagementController.getTableForOrder
);
router.post(
  '/get-active-ordersessions',
  auth(PermissionType.SHOP_APP, PermissionType.VIEW_ORDER),
  orderManagementController.getTableActiveOrderSessions
);
router.post(
  '/pay-ordersession',
  auth(PermissionType.SHOP_APP, PermissionType.UPDATE_ORDER),
  orderManagementController.payOrderSession
);
router.post(
  '/cancel-ordersession',
  auth(PermissionType.SHOP_APP, PermissionType.CANCEL_ORDER),
  orderManagementController.cancelOrderSession
);
router.post(
  '/cancel-ordersession-paid-status',
  auth(PermissionType.SHOP_APP, PermissionType.CANCEL_ORDER_PAID_STATUS),
  orderManagementController.cancelOrderSessionPaidStatus
);
router.post(
  '/discount-dishorder',
  auth(PermissionType.SHOP_APP, PermissionType.UPDATE_ORDER),
  orderManagementController.discountDishOrder
);
router.post(
  '/discount-ordersession',
  auth(PermissionType.SHOP_APP, PermissionType.UPDATE_ORDER),
  orderManagementController.discountOrderSession
);
router.post(
  '/remove-discount',
  auth(PermissionType.SHOP_APP, PermissionType.UPDATE_ORDER),
  orderManagementController.removeDiscountFromOrderSession
);
router.post(
  '/get-ordersession-history',
  auth(PermissionType.SHOP_APP, PermissionType.VIEW_ORDER),
  orderManagementController.getOrderSessionHistory
);
router
  .route('/unconfirmed-order')
  .get(auth(PermissionType.SHOP_APP, PermissionType.VIEW_ORDER), orderManagementController.getUnconfirmedOrder)
  .post(auth(PermissionType.SHOP_APP, PermissionType.APPROVE_ORDER), orderManagementController.approveUnconfirmedOrder)
  .patch(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_ORDER), orderManagementController.updateUnconfirmedOrder)
  .delete(auth(PermissionType.SHOP_APP, PermissionType.CANCEL_ORDER), orderManagementController.cancelUnconfirmedOrder);

// customer app
router.post('/get-cart', auth(), orderManagementController.getCart);
router.post('/update-cart', auth(), orderManagementController.updateCart);
router.post('/checkout-cart', auth(), orderManagementController.checkoutCart);
router.post('/checkout-cart-history', auth(), orderManagementController.getCheckoutCartHistory);
router.post('/unconfirmed-checkout-cart-history', auth(), orderManagementController.getUnconfirmedCheckoutCartHistory);

router
  .route('/:orderSessionId')
  .get(auth(PermissionType.SHOP_APP, PermissionType.VIEW_ORDER), orderManagementController.getOrderSessionDetail)
  .patch(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_ORDER), orderManagementController.updateOrderSession);

module.exports = router;
