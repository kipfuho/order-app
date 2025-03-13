const express = require('express');
const shopManagementController = require('../controllers/shopManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:tableId', auth(), shopManagementController.getTable);
router.post('/create', auth(), shopManagementController.createTable);
router.patch('/:tableId', auth(), shopManagementController.updateTable);
router.delete('/:tableId', auth(), shopManagementController.deleteTable);

module.exports = router;
