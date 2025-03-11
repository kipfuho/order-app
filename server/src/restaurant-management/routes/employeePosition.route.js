const express = require('express');
const restaurantManagementController = require('../controllers/restaurantManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:employeePositionId', auth(), restaurantManagementController.getEmployeePosition);
router.post('/create', auth(), restaurantManagementController.createEmployeePosition);
router.patch('/:employeePositionId', auth(), restaurantManagementController.updateEmployeePosition);
router.delete('/:employeePositionId', auth(), restaurantManagementController.deleteEmployeePosition);

module.exports = router;
