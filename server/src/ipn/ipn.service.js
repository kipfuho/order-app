const logger = require('../config/logger');
const { payOrderSession } = require('../order-management/services/orderManagement.service');
const { PaymentMethod } = require('../utils/constant');

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
  vnpayIpn,
};
