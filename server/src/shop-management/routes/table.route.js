const express = require('express');
const shopManagementController = require('../controllers/shopManagement.controller');
const auth = require('../../middlewares/auth');
const { PermissionType } = require('../../utils/constant');

const router = express.Router();

router
  .route('/:tableId')
  .get(auth(PermissionType.VIEW_SHOP), shopManagementController.getTable)
  .patch(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_SHOP), shopManagementController.updateTable)
  .delete(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_SHOP), shopManagementController.deleteTable);
router
  .route('/')
  .get(auth(PermissionType.VIEW_SHOP), shopManagementController.getTables)
  .post(auth(PermissionType.SHOP_APP, PermissionType.VIEW_SHOP), shopManagementController.createTable);

module.exports = router;
