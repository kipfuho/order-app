const express = require('express');
const orderManagementController = require('../controllers/orderManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/create-order', auth(), orderManagementController.createOrder);
router.post('/increase-dish-quantity', auth(), orderManagementController.increaseDishQuantity);
router.post('/decrease-dish-quantity', auth(), orderManagementController.decreaseDishQuantity);
router.post('/update-order', auth(), orderManagementController.updateOrder);
router.post('/get-orders', auth(), orderManagementController.getOrders);
router.post('/get-order-detail', auth(), orderManagementController.getOrderDetail);
router.post('/pay-order', auth(), orderManagementController.payOrder);
router.post('/cancel-order', auth(), orderManagementController.cancelOrder);
router.post('/cancel-paid-status', auth(), orderManagementController.cancelPaidStatus);
router.post('/get-order-history', orderManagementController.getOrderHistory);
router.post('/update-cart', auth(), orderManagementController.updateCart);
router.post('/checkout-cart', auth(), orderManagementController.checkoutCart);
router.post('/discount-dish', auth(), orderManagementController.discountDish);
router.post('/discount-order', auth(), orderManagementController.discountOrder);

module.exports = router;
