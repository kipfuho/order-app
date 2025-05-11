const express = require('express');
const kitchenController = require('../controllers/kitchen.controller');
const auth = require('../../middlewares/auth');
const { PermissionType } = require('../../utils/constant');

const router = express.Router();

///
router
  .route('/:kitchenId')
  .get(auth(PermissionType.VIEW_MENU), kitchenController.getKitchen)
  .patch(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_MENU), kitchenController.updateKitchen)
  .delete(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_MENU), kitchenController.deleteKitchen);
router
  .route('/')
  .get(auth(PermissionType.VIEW_MENU), kitchenController.getKitchens)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_MENU), kitchenController.createKitchen);

module.exports = router;
