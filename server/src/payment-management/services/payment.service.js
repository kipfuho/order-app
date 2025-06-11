const { ProductCode, VnpLocale, dateFormat } = require('vnpay');
const { calculateOrderSessionAndReturn } = require('../../order-management/services/orderUtils.service');
const { formatOrderSessionNo } = require('../../utils/common');
const { vnpay, vnpayConfig } = require('../../config/vnpay.config');

const getPaymentVnpayUrl = async ({ orderSessionId, ipAddress }) => {
  const orderSession = await calculateOrderSessionAndReturn(orderSessionId);

  const createDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

  const url = vnpay.buildPaymentUrl({
    vnp_Amount: orderSession.paymentAmount,
    vnp_IpAddr: ipAddress,
    vnp_TxnRef: orderSession.id,
    vnp_OrderInfo: `Thanh toan cho ma GD: ${formatOrderSessionNo(orderSession)}`,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: vnpayConfig.returnUrl,
    vnp_Locale: VnpLocale.EN,
    vnp_CreateDate: dateFormat(createDate, 'yyyyMMddHHmmss'),
  });

  return url;
};

module.exports = {
  getPaymentVnpayUrl,
};
