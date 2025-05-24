const express = require('express');
const reportManagementController = require('../controllers/reportManagement.controller');
const auth = require('../../middlewares/auth');
const { PermissionType } = require('../../utils/constant');

const router = express.Router();

router.post(
  '/daily-sales',
  auth(PermissionType.SHOP_APP, PermissionType.VIEW_REPORT),
  reportManagementController.getDailySalesReport
);
router.post(
  '/popular-dishes',
  auth(PermissionType.SHOP_APP, PermissionType.VIEW_REPORT),
  reportManagementController.getPopularDishesReport
);
router.post(
  '/payment-method-distribution',
  auth(PermissionType.SHOP_APP, PermissionType.VIEW_REPORT),
  reportManagementController.getPaymentMethodDistributionReport
);
router.post(
  '/hourly-sales',
  auth(PermissionType.SHOP_APP, PermissionType.VIEW_REPORT),
  reportManagementController.getHourlySalesReport
);
router.post(
  '/dashboard',
  auth(PermissionType.SHOP_APP, PermissionType.VIEW_REPORT),
  reportManagementController.getDashboard
);

module.exports = router;
