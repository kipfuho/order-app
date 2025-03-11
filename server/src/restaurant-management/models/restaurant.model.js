const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../models/plugins');
const { Status, RoundingPaymentType } = require('../../utils/constant');
const { deleteRestaurantCache } = require('../../metadata/common');
const logger = require('../../config/logger');

const RoundingPaymentTypeEnum = Object.values(RoundingPaymentType);

const restaurantSchema = mongoose.Schema(
  {
    status: { type: String, enum: [Status.enabled, Status.disabled], default: Status.enabled },
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    owner: { type: mongoose.Types.ObjectId, ref: 'User' },
    taxRate: { type: Number },
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

restaurantSchema.post('save', async function (doc) {
  try {
    const restaurantId = _.get(doc, '_id');
    if (!restaurantId) {
      return;
    }

    await deleteRestaurantCache({ restaurantId });
  } catch (err) {
    logger.error(`error running post hook save of restaurant model`);
  }
});

restaurantSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    const restaurantId = _.get(filter, '_id');
    if (!restaurantId) {
      return;
    }
    await deleteRestaurantCache({ restaurantId });
  } catch (err) {
    logger.error(`error running post hook update of restaurant model`);
  }
});

// add plugin that converts mongoose to json
restaurantSchema.plugin(toJSON);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
