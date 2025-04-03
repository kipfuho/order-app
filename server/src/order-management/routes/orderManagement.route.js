const express = require('express');
const orderManagementController = require('../controllers/orderManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/create-order', auth(), orderManagementController.createOrder);
router.post('/change-dish-quantity', auth(), orderManagementController.changeDishQuantity);
router.post('/update-order', auth(), orderManagementController.updateOrder);
router.post('/get-table-for-orders', auth(), orderManagementController.getTableForOrder);
router.post('/get-ordersession-detail', auth(), orderManagementController.getOrderSessionDetail);
router.post('/pay-ordersession', auth(), orderManagementController.payOrderSession);
router.post('/cancel-ordersession', auth(), orderManagementController.cancelOrderSession);
router.post('/cancel-ordersession-paid-status', auth(), orderManagementController.cancelOrderSessionPaidStatus);
router.post('/get-ordersession-history', orderManagementController.getOrderSessionHistory);
router.post('/update-cart', auth(), orderManagementController.updateCart);
router.post('/checkout-cart', auth(), orderManagementController.checkoutCart);
router.post('/discount-dishorder', auth(), orderManagementController.discountDishOrder);
router.post('/discount-ordersession', auth(), orderManagementController.discountOrderSession);

module.exports = router;
