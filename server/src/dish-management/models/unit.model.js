const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status, Countries } = require('../../utils/constant');
const { getShopCountry } = require('../../middlewares/clsHooked');
const { getStringId } = require('../../utils/common');
const { deleteUnitCache } = require('../../metadata/common');
const logger = require('../../config/logger');

const unitSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    name: { type: String, trim: true },
    code: { type: String, trim: true },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [Status.activated, Status.deactivated, Status.disabled],
      default: Status.activated,
    },
  },
  {
    timestamps: true,
  }
);

const defaultUnitList = {
  'Việt Nam': [
    { unitName: 'Ấm', unitCode: 'am' },
    { unitName: 'Bánh', unitCode: 'banh' },
    { unitName: 'Bao', unitCode: 'bao' },
    { unitName: 'Bắp', unitCode: 'bap' },
    { unitName: 'Bát', unitCode: 'bat' },
    { unitName: 'Bìa', unitCode: 'bia' },
    { unitName: 'Bịch', unitCode: 'bich' },
    { unitName: 'Bình', unitCode: 'binh' },
    { unitName: 'Bình (2l)', unitCode: 'binh2l' },
    { unitName: 'Bình (750gr)', unitCode: 'binh650gr' },
    { unitName: 'Bó', unitCode: 'bo1' },
    { unitName: 'Bộ', unitCode: 'bo2' },
    { unitName: 'Bó Hoa', unitCode: 'bohoa' },
    { unitName: 'Bom', unitCode: 'bom' },
    { unitName: 'Bông', unitCode: 'bong' },
    { unitName: 'Bottle', unitCode: 'bottle' },
    { unitName: 'Box', unitCode: 'box' },
    { unitName: 'Bundle', unitCode: 'bunndle' },
    { unitName: 'Ca', unitCode: 'ca' },
    { unitName: 'Cái', unitCode: 'cai' },
    { unitName: 'Can', unitCode: 'can' },
    { unitName: 'Cặp', unitCode: 'cap' },
    { unitName: 'Carafe', unitCode: 'carafe' },
    { unitName: 'Cây', unitCode: 'cay' },
    { unitName: 'Chai', unitCode: 'chai' },
    { unitName: 'Chén', unitCode: 'chen' },
    { unitName: 'Chiếc', unitCode: 'chien' },
    { unitName: 'Chum', unitCode: 'chum' },
    { unitName: 'Cốc', unitCode: 'coc' },
    { unitName: 'Con', unitCode: 'con' },
    { unitName: 'Củ', unitCode: 'cu' },
    { unitName: 'Cục', unitCode: 'cuc' },
    { unitName: 'Cuộn', unitCode: 'cuon' },
    { unitName: 'Cup', unitCode: 'cup' },
    { unitName: 'Dây', unitCode: 'day' },
    { unitName: 'Đĩa', unitCode: 'dia' },
    { unitName: 'Điếu', unitCode: 'dieu' },
    { unitName: 'Dish', unitCode: 'dish' },
    { unitName: 'Đôi', unitCode: 'doi' },
    { unitName: 'Đồng', unitCode: 'dong' },
    { unitName: 'Each', unitCode: 'each' },
    { unitName: 'Giờ', unitCode: 'gio' },
    { unitName: 'Giọt', unitCode: 'giot' },
    { unitName: 'Glass', unitCode: 'glass' },
    { unitName: 'Gói', unitCode: 'goi' },
    { unitName: 'Gram', unitCode: 'gram' },
    { unitName: 'Hạt', unitCode: 'hat' },
    { unitName: 'Hộp', unitCode: 'hop' },
    { unitName: 'Hộp (480gr)', unitCode: 'hop480gr' },
    { unitName: 'Hũ', unitCode: 'hu' },
    { unitName: 'Jug', unitCode: 'jug' },
    { unitName: 'Kệ', unitCode: 'ke' },
    { unitName: 'Keng', unitCode: 'keng' },
    { unitName: 'Két', unitCode: 'ket' },
    { unitName: 'Kg', unitCode: 'kg' },
    { unitName: 'Kg (338c)', unitCode: 'kg388c' },
    { unitName: 'Kg (490c)', unitCode: 'kg490c' },
    { unitName: 'Khay', unitCode: 'khay' },
    { unitName: 'Khoanh', unitCode: 'khoanh' },
    { unitName: 'Lá', unitCode: 'la' },
    { unitName: 'Lần', unitCode: 'lan' },
    { unitName: 'Lẵng', unitCode: 'lang1' },
    { unitName: 'Lạng', unitCode: 'lang2' },
    { unitName: 'Lát', unitCode: 'lat' },
    { unitName: 'Lít', unitCode: 'lit' },
    { unitName: 'Lọ', unitCode: 'lo' },
    { unitName: 'Lốc', unitCode: 'loc' },
    { unitName: 'Lon', unitCode: 'lon' },
    { unitName: 'Lon (320ml)', unitCode: 'lon320ml' },
    { unitName: 'Lồng', unitCode: 'long' },
    { unitName: 'Lượt', unitCode: 'luot' },
    { unitName: 'Ly', unitCode: 'ly' },
    { unitName: 'Mẻ', unitCode: 'me' },
    { unitName: 'Mét', unitCode: 'met1' },
    { unitName: 'Mẹt', unitCode: 'met2' },
    { unitName: 'Miếng', unitCode: 'mieng' },
    { unitName: 'Miligam', unitCode: 'miligam' },
    { unitName: 'ml', unitCode: 'ml' },
    { unitName: 'Mớ', unitCode: 'mo' },
    { unitName: 'Món', unitCode: 'mon' },
    { unitName: 'Muỗng', unitCode: 'muong' },
    { unitName: 'Nải', unitCode: 'nai' },
    { unitName: 'Nậm', unitCode: 'nam' },
    { unitName: 'Nhánh', unitCode: 'nhanh' },
    { unitName: 'Nồi', unitCode: 'noi' },
    { unitName: 'Ổ', unitCode: 'o' },
    { unitName: 'Ống', unitCode: 'ong' },
    { unitName: 'Pack', unitCode: 'pack' },
    { unitName: 'Part', unitCode: 'part' },
    { unitName: 'PCS', unitCode: 'pcs' },
    { unitName: 'Phần', unitCode: 'phan' },
    { unitName: 'Phin', unitCode: 'phin' },
    { unitName: 'Phong', unitCode: 'phong' },
    { unitName: 'Phút', unitCode: 'phut' },
    { unitName: 'Piece', unitCode: 'piece' },
    { unitName: 'PK', unitCode: 'pk' },
    { unitName: 'Portion', unitCode: 'portion' },
    { unitName: 'Pot', unitCode: 'pot' },
    { unitName: 'Quả', unitCode: 'qua' },
    { unitName: 'Que', unitCode: 'que' },
    { unitName: 'Quyển', unitCode: 'quyen' },
    { unitName: 'R', unitCode: 'r' },
    { unitName: 'Serve', unitCode: 'serve' },
    { unitName: 'Serving', unitCode: 'serving' },
    { unitName: 'Set', unitCode: 'set' },
    { unitName: 'Shot', unitCode: 'shot' },
    { unitName: 'Suất', unitCode: 'suat' },
    { unitName: 'Tập', unitCode: 'tap' },
    { unitName: 'TBSP', unitCode: 'tpsp' },
    { unitName: 'Tép', unitCode: 'tep' },
    { unitName: 'Thanh', unitCode: 'thanh' },
    { unitName: 'Tháp', unitCode: 'thap' },
    { unitName: 'Thố', unitCode: 'tho' },
    { unitName: 'Thỏi', unitCode: 'thoi' },
    { unitName: 'Thùng', unitCode: 'thung' },
    { unitName: 'Thùng (7680ml)', unitCode: 'thung7680ml' },
    { unitName: 'Tô', unitCode: 'to1' },
    { unitName: 'Tờ', unitCode: 'to2' },
    { unitName: 'Tờ giấy nến', unitCode: 'togiaynen' },
    { unitName: 'Trái', unitCode: 'trai' },
    { unitName: 'TSP', unitCode: 'tsp' },
    { unitName: 'Túi', unitCode: 'tui' },
    { unitName: 'Túi (1800gr)', unitCode: 'tui1800gr' },
    { unitName: 'Túi (970gr)', unitCode: 'tui970gr' },
    { unitName: 'Tuýp', unitCode: 'tuyp' },
    { unitName: 'Vại', unitCode: 'vai' },
    { unitName: 'Vắt', unitCode: 'vat' },
    { unitName: 'Vỉ', unitCode: 'vi' },
    { unitName: 'Viên', unitCode: 'vien' },
    { unitName: 'Xấp', unitCode: 'xap' },
    { unitName: 'Xếp', unitCode: 'xep' },
    { unitName: 'Xiên', unitCode: 'xien' },
    { unitName: 'Xô', unitCode: 'xo' },
    { unitName: 'Xuất', unitCode: 'xuat' },
    { unitName: 'Xúc', unitCode: 'xuc' },
    { unitName: 'Y', unitCode: 'y' },
  ],
};

unitSchema.statics.createDefaultUnits = async function (shopId) {
  const shopCountry = getShopCountry() || Countries.VietNam;
  const units = defaultUnitList[shopCountry];
  const bulkOps = _.map(units, (unit) => ({
    updateOne: {
      filter: { shop: shopId, code: unit.unitCode },
      update: { $set: { name: unit.unitName, code: unit.unitCode } },
      upsert: true,
    },
  }));
  return this.bulkWrite(bulkOps);
};

unitSchema.post('save', async function (doc) {
  try {
    const shopId = getStringId({ object: doc, key: 'shop' });
    await deleteUnitCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook save of unit model`);
  }
});

unitSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let shopId = _.get(filter, 'shop');
    const unitId = _.get(filter, '_id');
    if (!shopId) {
      const unit = await this.model.findById(unitId);
      shopId = _.get(unit, 'shop');
    }
    if (!shopId) {
      return;
    }
    await deleteUnitCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook update of unit model`);
  }
});

// add plugin that converts mongoose to json
unitSchema.plugin(toJSON);

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;
