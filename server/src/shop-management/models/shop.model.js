const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../utils/plugins');
const { Status, RoundingPaymentType } = require('../../utils/constant');
const { deleteShopCache } = require('../../metadata/common');
const logger = require('../../config/logger');

const RoundingPaymentTypeEnum = Object.values(RoundingPaymentType);

const shopSchema = mongoose.Schema(
  {
    status: { type: String, enum: [Status.enabled, Status.disabled], default: Status.enabled },
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    owner: { type: mongoose.Types.ObjectId, ref: 'User' },
    taxRate: { type: Number },
    location: { type: String },
    dishPriceRoundingType: { type: String, enum: RoundingPaymentTypeEnum, default: RoundingPaymentType.ROUND },
    discountRoundingType: { type: String, enum: RoundingPaymentTypeEnum, default: RoundingPaymentType.ROUND },
    taxRoundingType: { type: String, enum: RoundingPaymentTypeEnum, default: RoundingPaymentType.ROUND },
    calculateTaxDirectly: {
      type: Boolean,
    },
    country: {
      name: { type: String },
      currency: { type: String },
    },
    utcOffset: { type: Number, default: 7 },
    /**
     * Timezone string of moment.js
     * https://gist.github.com/diogocapela/12c6617fc87607d11fd62d2a4f42b02a
     */
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh',
    },
    reportTime: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

shopSchema.post('save', async function (doc) {
  try {
    const shopId = _.get(doc, '_id');
    if (!shopId) {
      return;
    }

    await deleteShopCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook save of shop model`);
  }
});

shopSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    const shopId = _.get(filter, '_id');
    if (!shopId) {
      return;
    }
    await deleteShopCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook update of shop model`);
  }
});

// add plugin that converts mongoose to json
shopSchema.plugin(toJSON);
shopSchema.plugin(paginate);

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
