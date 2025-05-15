const express = require('express');
const kdsController = require('../controllers/kds.controller');
const auth = require('../../middlewares/auth');
const { PermissionType } = require('../../utils/constant');

const router = express.Router();

router
  .route('/uncooked-dishorders')
  .get(auth(PermissionType.SHOP_APP, PermissionType.VIEW_KITCHEN), kdsController.getUncookedDishOrders)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_KITCHEN), kdsController.updateUncookedDishOrders)
  .patch(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_KITCHEN), kdsController.undoCookedDishOrders);
router
  .route('/unserved-dishorders')
  .get(auth(PermissionType.SHOP_APP, PermissionType.VIEW_KITCHEN), kdsController.getUnservedDishOrders)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_KITCHEN), kdsController.updateUnservedDishOrders)
  .patch(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_KITCHEN), kdsController.undoServedDishOrders);
router.post('/cooked-history', auth(PermissionType.SHOP_APP, PermissionType.VIEW_KITCHEN), kdsController.getCookedHistories);
router.post('/served-history', auth(PermissionType.SHOP_APP, PermissionType.VIEW_KITCHEN), kdsController.getServedHistories);

module.exports = router;
