const express = require('express');
const shopManagementController = require('../controllers/shopManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:employeeId', auth(), shopManagementController.getEmployee);
router.post('/create', auth(), shopManagementController.createEmployee);
router.patch('/:employeeId', auth(), shopManagementController.updateEmployee);
router.delete('/:employeeId', auth(), shopManagementController.deleteEmployee);

module.exports = router;
