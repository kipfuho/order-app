const express = require('express');
const shopManagementController = require('../controllers/shopManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:tablePositionId', auth(), shopManagementController.getTablePosition);
router.post('/create', auth(), shopManagementController.createTablePosition);
router.patch('/:tablePositionId', auth(), shopManagementController.updateTablePosition);
router.delete('/:tablePositionId', auth(), shopManagementController.deleteTablePosition);

module.exports = router;
