const _ = require('lodash');
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

  return res.status(201).json({ url: vnPayUrl, pid: orderSessionId });
});

const vnpayIpn = catchAsync(async (req, res) => {
  const orderSessionId = req.query.vnp_TxnRef;

  const vnpayPaymentAmount = _.get(req, 'query.vnp_Amount', 0);
  const error = await paymentService.vnpayIpn({ orderSessionId, vnpayPaymentAmount });

  if (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ RspCode: '99', Message: error.message });
  } else {
    res.status(httpStatus.OK).send({ RspCode: '00', Message: 'Success' });
  }
});

module.exports = {
  getPaymentVnpayUrl,
  vnpayIpn,
};
