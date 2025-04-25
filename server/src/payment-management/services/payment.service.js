const { ProductCode, VnpLocale, dateFormat } = require('vnpay');
const { getOrderSessionById } = require('../../order-management/services/orderUtils.service');
const { formatOrderSessionNo } = require('../../utils/common');
const { vnpay, vnpayConfig } = require('../configs/vnpay.config');
const logger = require('../../config/logger');
const { payOrderSession } = require('../../order-management/services/orderManagement.service');
const { PaymentMethod } = require('../../utils/constant');

const getPaymentVnpayUrl = async ({ orderSessionId, ipAddress }) => {
  const orderSession = await getOrderSessionById(orderSessionId);

  const createDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

  const url = vnpay.buildPaymentUrl({
    vnp_Amount: orderSession.paymentAmount * 100,
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

const vnpayIpn = async ({ orderSessionId, vnpayPaymentAmount }) => {
  try {
    logger.info(`Recieved VNPAY IPN: ${orderSessionId}`);

    await payOrderSession({
      requestBody: {
        orderSessionId,
        paymentDetails: [
          {
            paymentMethod: PaymentMethod.VNPAY,
            paymentAmount: vnpayPaymentAmount / 100,
          },
        ],
      },
    });
  } catch (error) {
    return error;
  }
};

module.exports = {
  getPaymentVnpayUrl,
  vnpayIpn,
};
