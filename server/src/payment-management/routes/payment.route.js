const express = require('express');
const auth = require('../../middlewares/auth');
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

router.post('/vnpay/getUrl', auth(), paymentController.getPaymentVnpayUrl);
router.get('/vnpay/ipn', paymentController.vnpayIpn);

module.exports = router;
