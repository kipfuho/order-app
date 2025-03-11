const express = require('express');
const dailyReportController = require('../controllers/reportManagement.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:dishId', auth(), dailyReportController.getDish);

module.exports = router;
