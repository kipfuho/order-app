const express = require('express');
const shopManagementController = require('../controllers/shopManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:departmentId', auth(), shopManagementController.getDepartment);
router
  .route('/')
  .get(auth(), shopManagementController.getDepartments)
  .post(auth(), shopManagementController.createDepartment);
router.patch('/:departmentId', auth(), shopManagementController.updateDepartment);
router.delete('/:departmentId', auth(), shopManagementController.deleteDepartment);

module.exports = router;
