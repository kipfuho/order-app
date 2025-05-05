const _ = require('lodash');
const httpStatus = require('http-status');
const ipnService = require('./ipn.service');
const catchAsync = require('../utils/catchAsync');

const vnpayIpn = catchAsync(async (req, res) => {
  const orderSessionId = req.query.vnp_TxnRef;

  const vnpayPaymentAmount = _.get(req, 'query.vnp_Amount', 0);
  const error = await ipnService.vnpayIpn({ orderSessionId, vnpayPaymentAmount });

  if (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ RspCode: '99', Message: error.message });
  } else {
    res.status(httpStatus.OK).send({ RspCode: '00', Message: 'Success' });
  }
});

module.exports = { vnpayIpn };
