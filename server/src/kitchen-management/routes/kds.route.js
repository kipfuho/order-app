const express = require('express');
const kitchenController = require('../controllers/kitchen.controller');
const auth = require('../../middlewares/auth');
const { PermissionType } = require('../../utils/constant');

const router = express.Router();

router
  .route('/uncooked-dishorders')
  .get(auth(PermissionType.SHOP_APP, PermissionType.VIEW_KITCHEN), kitchenController.getUncookedDishOrders)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_KITCHEN), kitchenController.updateUncookedDishOrders)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_KITCHEN), kitchenController.undoCookedDishOrders);
router
  .route('/unserved-dishorders')
  .get(auth(PermissionType.SHOP_APP, PermissionType.VIEW_KITCHEN), kitchenController.getUnservedDishOrders)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_KITCHEN), kitchenController.updateUnservedDishOrders)
  .patch(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_KITCHEN), kitchenController.undoServedDishOrders);
router.post(
  '/cooked-history',
  auth(PermissionType.SHOP_APP, PermissionType.VIEW_KITCHEN),
  kitchenController.getCookedHistories
);
router.post(
  '/served-history',
  auth(PermissionType.SHOP_APP, PermissionType.VIEW_KITCHEN),
  kitchenController.getServedHistories
);

module.exports = router;
