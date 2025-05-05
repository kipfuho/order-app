const { VNPay } = require('vnpay');
const config = require('./config');

const vnpayConfig = {
  url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  terminalId: config.vnpay.terminalId,
  hashSecret: config.vnpay.secret,
  returnUrl: `${config.baseUrl}/v1/webhooks/vnpay-return`,
  ipnUrl: `${config.baseUrl}/v1/payment/vnpay/ipn`,
};

const vnpay = new VNPay({
  api_Host: 'https://sandbox.vnpayment.vn',
  tmnCode: config.vnpay.terminalId,
  secureSecret: config.vnpay.secret,
  testMode: true,
});

module.exports = { vnpayConfig, vnpay };
