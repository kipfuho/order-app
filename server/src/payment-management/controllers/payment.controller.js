const { ProductCode, VnpLocale, dateFormat } = require('vnpay');
const { getOrderSessionById } = require('../../order-management/services/orderUtils.service');
const { formatOrderSessionNo } = require('../../utils/common');
const { vnpay, vnpayConfig } = require('../configs/vnpay.config');
const logger = require('../../config/logger');
const { payOrderSession } = require('../../order-management/services/orderManagement.service');
const { PaymentMethod } = require('../../utils/constant');

const getPaymentVnpayUrl = async (req, res) => {
  const { orderSessionId } = req.body;

  try {
    const orderSession = await getOrderSessionById(orderSessionId);

    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const createDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

    const url = vnpay.buildPaymentUrl({
      vnp_Amount: orderSession.paymentAmount * 100,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: orderSession.id,
      vnp_OrderInfo: `Thanh toan cho ma GD: ${formatOrderSessionNo(orderSession)}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: vnpayConfig.returnUrl,
      vnp_Locale: VnpLocale.EN,
      vnp_CreateDate: dateFormat(createDate, 'yyyyMMddHHmmss'),
    });

    return res.status(201).json({ url, pid: orderSessionId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const vnpayIpn = async (req, res) => {
  try {
    const orderSessionId = req.query.vnp_TxnRef;
    logger.info(`Recieved VNPAY IPN: ${orderSessionId}`);

    await payOrderSession({
      requestBody: {
        orderSessionId,
        paymentDetails: [
          {
            paymentMethod: PaymentMethod.VNPAY,
            paymentAmount: req.query.vnp_Amount / 100,
          },
        ],
      },
    });

    return res.status(200).json({ RspCode: '00', Message: 'Success' });
  } catch (error) {
    return res.status(500).json({ RspCode: '99', Message: error.message });
  }
};

module.exports = {
  getPaymentVnpayUrl,
  vnpayIpn,
};
