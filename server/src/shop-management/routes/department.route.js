const express = require('express');
const shopManagementController = require('../controllers/shopManagement.controller');
const auth = require('../../middlewares/auth');
const { PermissionType } = require('../../utils/constant');

const router = express.Router();

router
  .route('/:departmentId')
  .get(auth(PermissionType.VIEW_SHOP), shopManagementController.getDepartment)
  .patch(
    '/:departmentId',
    auth(PermissionType.SHOP_APP, PermissionType.UPDATE_SHOP),
    shopManagementController.updateDepartment
  )
  .delete(
    '/:departmentId',
    auth(PermissionType.SHOP_APP, PermissionType.UPDATE_SHOP),
    shopManagementController.deleteDepartment
  );
router
  .route('/')
  .get(auth(PermissionType.VIEW_SHOP), shopManagementController.getDepartments)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_SHOP), shopManagementController.createDepartment);

module.exports = router;
