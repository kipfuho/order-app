const express = require('express');
const shopManagementController = require('../controllers/shopManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:employeePositionId', auth(), shopManagementController.getEmployeePosition);
router
  .route('/')
  .get(auth(), shopManagementController.getEmployeePositions)
  .post(auth(), shopManagementController.createEmployeePosition);
router.patch('/:employeePositionId', auth(), shopManagementController.updateEmployeePosition);
router.delete('/:employeePositionId', auth(), shopManagementController.deleteEmployeePosition);

module.exports = router;
