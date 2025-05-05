const express = require('express');
const auth = require('../../middlewares/auth');
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

router.post('/vnpay-url', auth(), paymentController.getPaymentVnpayUrl);

module.exports = router;
