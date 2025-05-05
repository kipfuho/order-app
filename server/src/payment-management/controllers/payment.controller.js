const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const paymentService = require('../services/payment.service');

const getPaymentVnpayUrl = catchAsync(async (req, res) => {
  const { orderSessionId } = req.body;

  const ipAddress =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  const vnPayUrl = await paymentService.getPaymentVnpayUrl({ orderSessionId, ipAddress });

  return res.status(httpStatus.CREATED).json({ url: vnPayUrl, pid: orderSessionId });
});

module.exports = {
  getPaymentVnpayUrl,
};
