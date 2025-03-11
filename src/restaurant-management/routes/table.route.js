const express = require('express');
const restaurantManagementController = require('../controllers/restaurantManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:tableId', auth(), restaurantManagementController.getTable);
router.post('/create', auth(), restaurantManagementController.createTable);
router.patch('/:tableId', auth(), restaurantManagementController.updateTable);
router.delete('/:tableId', auth(), restaurantManagementController.deleteTable);

module.exports = router;
