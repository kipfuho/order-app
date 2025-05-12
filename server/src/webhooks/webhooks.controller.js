const ipnService = require('./webhooks.service');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');

const vnpayReturn = catchAsync(async (req, res) => {
  const verified = await ipnService.verifyVnpayReturn(req.query);

  if (verified) {
    res.redirect(`${config.baseUrl}/payment/success`);
  } else {
    res.redirect(`${config.baseUrl}/payment/failed`);
  }
});

module.exports = { vnpayReturn };
