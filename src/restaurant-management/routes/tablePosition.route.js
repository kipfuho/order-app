const express = require('express');
const restaurantManagementController = require('../controllers/restaurantManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:tablePositionId', auth(), restaurantManagementController.getTablePosition);
router.post('/create', auth(), restaurantManagementController.createTablePosition);
router.patch('/:tablePositionId', auth(), restaurantManagementController.updateTablePosition);
router.delete('/:tablePositionId', auth(), restaurantManagementController.deleteTablePosition);

module.exports = router;
