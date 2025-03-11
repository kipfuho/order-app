const express = require('express');
const restaurantManagementController = require('../controllers/restaurantManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:departmentId', auth(), restaurantManagementController.getDepartment);
router.post('/create', auth(), restaurantManagementController.createDepartment);
router.patch('/:departmentId', auth(), restaurantManagementController.updateDepartment);
router.delete('/:departmentId', auth(), restaurantManagementController.deleteDepartment);

module.exports = router;
