const _ = require('lodash');
const { PrismaClient } = require('@prisma/client');
const { deleteShopCache } = require('../metadata/common');
const config = require('../config/config');

const prisma = new PrismaClient({
  datasourceUrl: config.postgresql.url,
});

prisma.$extends({
  name: 'refreshCache',
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
});

module.exports = prisma;
