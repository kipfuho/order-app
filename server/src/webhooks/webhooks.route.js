const express = require('express');
const webhooksController = require('./webhooks.controller');

const router = express.Router();

router.get('/vnpay-return', webhooksController.vnpayReturn);

module.exports = router;
