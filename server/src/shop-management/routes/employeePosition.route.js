const express = require('express');
const shopManagementController = require('../controllers/shopManagement.controller');
const auth = require('../../middlewares/auth');
const { PermissionType } = require('../../utils/constant');

const router = express.Router();

router
  .route('/:employeePositionId')
  .get(auth(PermissionType.VIEW_EMPLOYEE), shopManagementController.getEmployeePosition)
  .patch(
    '/:employeePositionId',
    auth(PermissionType.SHOP_APP, PermissionType.UPDATE_EMPLOYEE),
    shopManagementController.updateEmployeePosition
  )
  .delete(
    '/:employeePositionId',
    auth(PermissionType.SHOP_APP, PermissionType.UPDATE_EMPLOYEE),
    shopManagementController.deleteEmployeePosition
  );
router
  .route('/')
  .get(auth(PermissionType.VIEW_EMPLOYEE), shopManagementController.getEmployeePositions)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_EMPLOYEE), shopManagementController.createEmployeePosition);

module.exports = router;
