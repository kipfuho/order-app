const _ = require('lodash');
const ipnService = require('./webhooks.service');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');

const vnpayReturn = catchAsync(async (req, res) => {
  const orderSessionId = req.query.vnp_TxnRef;

  const vnpayPaymentAmount = _.get(req, 'query.vnp_Amount', 0);
  const verified = await ipnService.verifyVnpayReturn({ orderSessionId, vnpayPaymentAmount });

  if (verified) {
    res.redirect(`${config.baseUrl}/payment/success`);
  } else {
    res.redirect(`${config.baseUrl}/payment/failed`);
  }
});

module.exports = { vnpayReturn };
