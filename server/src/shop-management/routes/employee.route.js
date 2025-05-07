const express = require('express');
const shopManagementController = require('../controllers/shopManagement.controller');
const auth = require('../../middlewares/auth');
const { PermissionType } = require('../../utils/constant');

const router = express.Router();

router.get('/permissionTypes', auth(), shopManagementController.getPermissionTypes);
router
  .route('/:employeeId')
  .get(auth(PermissionType.VIEW_EMPLOYEE), shopManagementController.getEmployee)
  .patch(
    '/:employeeId',
    auth(PermissionType.SHOP_APP, PermissionType.UPDATE_EMPLOYEE),
    shopManagementController.updateEmployee
  )
  .delete(
    '/:employeeId',
    auth(PermissionType.SHOP_APP, PermissionType.UPDATE_EMPLOYEE),
    shopManagementController.deleteEmployee
  );
router
  .route('/')
  .get(auth(PermissionType.VIEW_EMPLOYEE), shopManagementController.getEmployees)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_EMPLOYEE), shopManagementController.createEmployee);

module.exports = router;
