const express = require('express');
const restaurantManagementController = require('../controllers/restaurantManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:employeeId', auth(), restaurantManagementController.getEmployee);
router.post('/create', auth(), restaurantManagementController.createEmployee);
router.patch('/:employeeId', auth(), restaurantManagementController.updateEmployee);
router.delete('/:employeeId', auth(), restaurantManagementController.deleteEmployee);

module.exports = router;
