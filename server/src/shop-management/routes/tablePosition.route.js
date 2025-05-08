const express = require('express');
const shopManagementController = require('../controllers/shopManagement.controller');
const auth = require('../../middlewares/auth');
const { PermissionType } = require('../../utils/constant');

const router = express.Router();

router
  .route('/:tablePositionId')
  .get(auth(PermissionType.VIEW_SHOP), shopManagementController.getTablePosition)
  .patch(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_SHOP), shopManagementController.updateTablePosition)
  .delete(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_SHOP), shopManagementController.deleteTablePosition);
router
  .route('/')
  .get(auth(PermissionType.VIEW_SHOP), shopManagementController.getTablePositions)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_SHOP), shopManagementController.createTablePosition);

module.exports = router;
