const express = require('express');
const ipnController = require('./ipn.controller');

const router = express.Router();

router.get('/vnpay', ipnController.vnpayIpn);

module.exports = router;
