const express = require('express');
const shopManagementController = require('../controllers/shopManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/permissionTypes', auth(), shopManagementController.getPermissionTypes);
router.get('/:employeeId', auth(), shopManagementController.getEmployee);
router.route('/').get(auth(), shopManagementController.getEmployees).post(auth(), shopManagementController.createEmployee);
router.patch('/:employeeId', auth(), shopManagementController.updateEmployee);
router.delete('/:employeeId', auth(), shopManagementController.deleteEmployee);

module.exports = router;
