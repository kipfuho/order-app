const _ = require('lodash');
const { PrismaClient } = require('@prisma/client');
const { deleteShopCache } = require('../metadata/common');
const config = require('../config/config');
const { DefaultUnitList, Countries } = require('./constant');
const { getShopCountry } = require('../middlewares/clsHooked');

const prisma = new PrismaClient({
  datasourceUrl: config.postgresql.url,
});

prisma.$extends({
  query: {
    shop: {
      async update({ args, query }) {
        const shopId = args.where.id;
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteShopCache({ shopId });
        return result;
      },
      async upsert({ args, query }) {
        const shopId = _.get(args, 'where.id');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteShopCache({ shopId });
        return result;
      },
    },
    // todo: add later
  },
  model: {
    user: {
      async isEmailTaken(email, excludeUserId) {
        const user = await prisma.user.findFirst({
          where: {
            email,
            id: { not: excludeUserId },
          },
        });
        return !!user;
      },
    },
    unit: {
      async createDefaultUnits(shopId) {
        const shopCountry = getShopCountry() || Countries.VietNam;
        const units = DefaultUnitList[shopCountry];
        await Promise.all(
          units.map((unit) => {
            return prisma.unit.upsert({
              data: { name: unit.unitName, code: unit.unitCode },
              where: { shopId, code: unit.unitCode },
              create: { name: unit.unitName, code: unit.unitCode, shopId },
            });
          })
        );
      },
    },
    s3Log: {
      async updateInUseKeys({ keys }) {
        return Promise.all(keys.map((key) => prisma.s3Log.update({ where: { key }, data: { inUse: true } })));
      },

      async disableInUseKeys({ keys }) {
        return Promise.all(keys.map((key) => prisma.s3Log.update({ where: { key }, data: { inUse: false } })));
      },
    },
  },
});

module.exports = prisma;
