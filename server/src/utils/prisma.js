const _ = require('lodash');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const {
  deleteShopCache,
  deleteMenuCache,
  deleteCustomerCache,
  deleteTablePositionCache,
  deleteTableCache,
  deleteUnitCache,
  deleteDepartmentCache,
  deleteEmployeePositionCache,
  deleteEmployeeCache,
  deleteKitchenCache,
} = require('../metadata/common');
const config = require('../config/config');
const { DefaultUnitList, Countries } = require('./constant');
const { getShopCountry } = require('../middlewares/clsHooked');

/** @type {import('@prisma/client').PrismaClient} */
const prisma = new PrismaClient({
  datasourceUrl: config.postgresql.url,
}).$extends({
  query: {
    shop: {
      async update({ args, query }) {
        const shopId = _.get(args, 'where.id');
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
        if (_.get(args, 'data.password')) {
          // eslint-disable-next-line no-param-reassign
          args.data.password = await bcrypt.hash(args.data.password, 8);
        }
        return query(args);
      },
      async update({ args, query }) {
        if (_.get(args, 'data.password')) {
          // eslint-disable-next-line no-param-reassign
          args.data.password = await bcrypt.hash(args.data.password, 8);
        }
        return query(args);
      },
    },
    customer: {
      async update({ args, query }) {
        const customerId = _.get(args, 'where.id');
        if (!customerId) {
          return query(args);
        }
        const result = await query(args);
        await deleteCustomerCache({ customerId });
        return result;
      },
      async delete({ args, query }) {
        const customerId = _.get(args, 'where.id');
        if (!customerId) {
          return query(args);
        }
        const result = await query(args);
        await deleteCustomerCache({ customerId });
        return result;
      },
    },
    tablePosition: {
      async create({ args, query }) {
        const shopId = _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteTablePositionCache({ shopId });
        return result;
      },
      async createMany({ args, query }) {
        const shopId = _.get(args, 'data.shopId') || _.get(args, 'data.0.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteTablePositionCache({ shopId });
        return result;
      },
      async update({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const tablePositionId = _.get(args, 'where.id');
          const tablePosition = await prisma.tablePosition.findUnique({ where: { id: tablePositionId } });
          shopId = tablePosition.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteTablePositionCache({ shopId });
        return result;
      },
      async updateMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId') || _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteTablePositionCache({ shopId });
        return result;
      },
      async delete({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const tablePositionId = _.get(args, 'where.id');
          const tablePosition = await prisma.table.findUnique({ where: { id: tablePositionId } });
          shopId = tablePosition.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteTablePositionCache({ shopId });
        return result;
      },
      async deleteMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteTablePositionCache({ shopId });
        return result;
      },
    },
    table: {
      async create({ args, query }) {
        const shopId = _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteTableCache({ shopId });
        return result;
      },
      async createMany({ args, query }) {
        const shopId = _.get(args, 'data.shopId') || _.get(args, 'data.0.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteTableCache({ shopId });
        return result;
      },
      async update({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const tableId = _.get(args, 'where.id');
          const table = await prisma.table.findUnique({ where: { id: tableId } });
          shopId = table.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteTableCache({ shopId });
        return result;
      },
      async updateMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId') || _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteTableCache({ shopId });
        return result;
      },
      async delete({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const tableId = _.get(args, 'where.id');
          const table = await prisma.table.findUnique({ where: { id: tableId } });
          shopId = table.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteTableCache({ shopId });
        return result;
      },
      async deleteMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteTableCache({ shopId });
        return result;
      },
    },
    dish: {
      async create({ args, query }) {
        const shopId = _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        return result;
      },
      async createMany({ args, query }) {
        const shopId = _.get(args, 'data.shopId') || _.get(args, 'data.0.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        return result;
      },
      async update({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const dishId = _.get(args, 'where.id');
          const dish = await prisma.dish.findUnique({ where: { id: dishId } });
          shopId = dish.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        return result;
      },
      async updateMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId') || _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        return result;
      },
      async delete({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const dishId = _.get(args, 'where.id');
          const dish = await prisma.dish.findUnique({ where: { id: dishId } });
          shopId = dish.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        return result;
      },
      async deleteMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        return result;
      },
    },
    dishCategory: {
      async create({ args, query }) {
        const shopId = _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        return result;
      },
      async createMany({ args, query }) {
        const shopId = _.get(args, 'data.shopId') || _.get(args, 'data.0.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        return result;
      },
      async update({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const dishCategoryId = _.get(args, 'where.id');
          const dishCategory = await prisma.dishCategory.findUnique({ where: { id: dishCategoryId } });
          shopId = dishCategory.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        return result;
      },
      async updateMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId') || _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        return result;
      },
      async delete({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const dishCategoryId = _.get(args, 'where.id');
          const dishCategory = await prisma.dishCategory.findUnique({ where: { id: dishCategoryId } });
          shopId = dishCategory.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        return result;
      },
      async deleteMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        return result;
      },
    },
    unit: {
      async create({ args, query }) {
        const shopId = _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteUnitCache({ shopId });
        return result;
      },
      async createMany({ args, query }) {
        const shopId = _.get(args, 'data.shopId') || _.get(args, 'data.0.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteUnitCache({ shopId });
        return result;
      },
      async update({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const unitId = _.get(args, 'where.id');
          const unit = await prisma.unit.findUnique({ where: { id: unitId } });
          shopId = unit.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteUnitCache({ shopId });
        return result;
      },
      async updateMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId') || _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteUnitCache({ shopId });
        return result;
      },
      async delete({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const unitId = _.get(args, 'where.id');
          const unit = await prisma.dish.findUnique({ where: { id: unitId } });
          shopId = unit.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteUnitCache({ shopId });
        return result;
      },
      async deleteMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteUnitCache({ shopId });
        return result;
      },
    },
    employeeDepartment: {
      async create({ args, query }) {
        const shopId = _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteDepartmentCache({ shopId });
        return result;
      },
      async createMany({ args, query }) {
        const shopId = _.get(args, 'data.shopId') || _.get(args, 'data.0.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteDepartmentCache({ shopId });
        return result;
      },
      async update({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const employeeDepartmentId = _.get(args, 'where.id');
          const employeeDepartment = await prisma.employeeDepartment.findUnique({ where: { id: employeeDepartmentId } });
          shopId = employeeDepartment.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteDepartmentCache({ shopId });
        return result;
      },
      async updateMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId') || _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteDepartmentCache({ shopId });
        return result;
      },
      async delete({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const employeeDepartmentId = _.get(args, 'where.id');
          const employeeDepartment = await prisma.employeeDepartment.findUnique({ where: { id: employeeDepartmentId } });
          shopId = employeeDepartment.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteDepartmentCache({ shopId });
        return result;
      },
      async deleteMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteDepartmentCache({ shopId });
        return result;
      },
    },
    employeePosition: {
      async create({ args, query }) {
        const shopId = _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteEmployeePositionCache({ shopId });
        return result;
      },
      async createMany({ args, query }) {
        const shopId = _.get(args, 'data.shopId') || _.get(args, 'data.0.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteEmployeePositionCache({ shopId });
        return result;
      },
      async update({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const employeePositionId = _.get(args, 'where.id');
          const employeePosition = await prisma.employeePosition.findUnique({ where: { id: employeePositionId } });
          shopId = employeePosition.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteEmployeePositionCache({ shopId });
        return result;
      },
      async updateMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId') || _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteEmployeePositionCache({ shopId });
        return result;
      },
      async delete({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const employeePositionId = _.get(args, 'where.id');
          const employeePosition = await prisma.employeePosition.findUnique({ where: { id: employeePositionId } });
          shopId = employeePosition.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteEmployeePositionCache({ shopId });
        return result;
      },
      async deleteMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteEmployeePositionCache({ shopId });
        return result;
      },
    },
    employee: {
      async create({ args, query }) {
        const shopId = _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteEmployeeCache({ shopId });
        return result;
      },
      async createMany({ args, query }) {
        const shopId = _.get(args, 'data.shopId') || _.get(args, 'data.0.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteEmployeeCache({ shopId });
        return result;
      },
      async update({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const employeeId = _.get(args, 'where.id');
          const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
          shopId = employee.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteEmployeeCache({ shopId });
        return result;
      },
      async updateMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId') || _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteEmployeeCache({ shopId });
        return result;
      },
      async delete({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const employeeId = _.get(args, 'where.id');
          const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
          shopId = employee.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteEmployeeCache({ shopId });
        return result;
      },
      async deleteMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteEmployeeCache({ shopId });
        return result;
      },
    },
    kitchen: {
      async create({ args, query }) {
        const shopId = _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteKitchenCache({ shopId });
        return result;
      },
      async createMany({ args, query }) {
        const shopId = _.get(args, 'data.shopId') || _.get(args, 'data.0.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteKitchenCache({ shopId });
        return result;
      },
      async update({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const kitchenId = _.get(args, 'where.id');
          const kitchen = await prisma.kitchen.findUnique({ where: { id: kitchenId } });
          shopId = kitchen.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteKitchenCache({ shopId });
        return result;
      },
      async updateMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId') || _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteKitchenCache({ shopId });
        return result;
      },
      async delete({ args, query }) {
        let shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          const kitchenId = _.get(args, 'where.id');
          const kitchen = await prisma.dish.findUnique({ where: { id: kitchenId } });
          shopId = kitchen.shopId;
        }
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteKitchenCache({ shopId });
        return result;
      },
      async deleteMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteKitchenCache({ shopId });
        return result;
      },
    },
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
        return prisma.unit.createMany({
          data: units.map((unit) => ({ code: unit.unitCode, name: unit.unitName, shopId })),
        });
      },
    },
    s3Log: {
      async updateInUseKeys({ keys }) {
        return prisma.s3Log.updateMany({ where: { key: { in: keys } }, data: { inUse: true } });
      },

      async removeInUseKeys({ keys }) {
        return prisma.s3Log.updateMany({ where: { key: { in: keys } }, data: { inUse: false } });
      },
    },
  },
});

module.exports = prisma;
