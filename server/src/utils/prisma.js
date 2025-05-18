const _ = require('lodash');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { deleteShopCache } = require('../metadata/common');
const config = require('../config/config');
const { DefaultUnitList, Countries } = require('./constant');
const { getShopCountry } = require('../middlewares/clsHooked');

const prisma = new PrismaClient({
  datasourceUrl: config.postgresql.url,
}).$extends({
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
    user: {
      async create({ args, query }) {
        // eslint-disable-next-line no-param-reassign
        args.data.password = await bcrypt.hash(args.data.password, 8);
        return query(args);
      },
      async update({ args, query }) {
        if (args.data.password) {
          // eslint-disable-next-line no-param-reassign
          args.data.password = await bcrypt.hash(args.data.password, 8);
        }
        return query(args);
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
        return prisma.$transaction(
          units.map((unit) =>
            prisma.unit.upsert({
              where: {
                unit_code_unique: {
                  shopId,
                  code: unit.unitCode,
                },
              },
              update: {
                name: unit.unitName,
                code: unit.unitCode,
              },
              create: {
                shopId,
                name: unit.unitName,
                code: unit.unitCode,
              },
            })
          )
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
