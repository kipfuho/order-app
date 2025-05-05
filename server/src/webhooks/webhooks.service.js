const crypto = require('crypto');
const qs = require('qs');
const { sortObject } = require('../utils/common');
const { vnpay } = require('../config/config');

const verifyVnpayReturn = async (vnpParams) => {
  const secureHash = vnpParams.vnp_SecureHash;

  // eslint-disable-next-line no-param-reassign
  delete vnpParams.vnp_SecureHash;
  // eslint-disable-next-line no-param-reassign
  delete vnpParams.vnp_SecureHashType;
  // eslint-disable-next-line no-param-reassign
  vnpParams = sortObject(vnpParams);

  const { secret } = vnpay;

  const signData = qs.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return secureHash === signed;
};

module.exports = {
  verifyVnpayReturn,
};
