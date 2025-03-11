const express = require('express');
const customerManagementController = require('../controllers/customerManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:customerId', auth(), customerManagementController.getCustomer);
router.post('/create', auth(), customerManagementController.createCustomer);
router.patch('/:customerId', auth(), customerManagementController.updateCustomer);
router.delete('/:customerId', auth(), customerManagementController.deleteCustomer);

module.exports = router;
