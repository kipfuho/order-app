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
  deleteEmployeeByUserIdCache,
  deleteUserCache,
  deleteTFIDFCache,
} = require('../metadata/common');
const config = require('../config/config');
const { DefaultUnitList, Countries } = require('./constant');
const { getShopCountry } = require('../middlewares/clsHooked');
const logger = require('../config/logger');

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
        await deleteTFIDFCache({ shopId });
        return result;
      },
      async createMany({ args, query }) {
        const shopId = _.get(args, 'data.shopId') || _.get(args, 'data.0.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        await deleteTFIDFCache({ shopId });
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
        await deleteTFIDFCache({ shopId });
        return result;
      },
      async updateMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId') || _.get(args, 'data.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        await deleteTFIDFCache({ shopId });
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
        await deleteTFIDFCache({ shopId });
        return result;
      },
      async deleteMany({ args, query }) {
        const shopId = _.get(args, 'where.shopId');
        if (!shopId) {
          return query(args);
        }
        const result = await query(args);
        await deleteMenuCache({ shopId });
        await deleteTFIDFCache({ shopId });
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

/**
 * PostgreSQL Table Name
 * Keys should match values
 */
const PostgreSQLTable = {
  Cart: 'Cart',
  CartItem: 'CartItem',
  Customer: 'Customer',
  Discount: 'Discount',
  DiscountProduct: 'DiscountProduct',
  Dish: 'Dish',
  DishCategory: 'DishCategory',
  DishOrder: 'DishOrder',
  Employee: 'Employee',
  EmployeePosition: 'EmployeePosition',
  EmployeeDepartment: 'EmployeeDepartment',
  Kitchen: 'Kitchen',
  KitchenLog: 'KitchenLog',
  Order: 'Order',
  OrderSession: 'OrderSession',
  PaymentDetail: 'PaymentDetail',
  ReturnedDishOrder: 'ReturnedDishOrder',
  S3Log: 'S3Log',
  Shop: 'Shop',
  Table: 'Table',
  TablePosition: 'TablePosition',
  TaxDetail: 'TaxDetail',
  Token: 'Token',
  Unit: 'Unit',
  User: 'User',
};

/**
 * PostgreSQL Table field's enum type by table
 * Should match Prisma schema
 */
const PostgreSQLEnumByTable = {
  [PostgreSQLTable.Cart]: {
    status: 'Status',
  },
  [PostgreSQLTable.Customer]: {
    status: 'Status',
  },
  [PostgreSQLTable.Discount]: {
    discountType: 'DiscountType',
    discountValueType: 'DiscountValueType',
  },
  [PostgreSQLTable.DiscountProduct]: {
    discountValueType: 'DiscountValueType',
  },
  [PostgreSQLTable.Dish]: {
    status: 'Switchabletatus',
    type: 'DishType',
  },
  [PostgreSQLTable.DishCategory]: {
    status: 'Status',
  },
  [PostgreSQLTable.DishOrder]: {
    status: 'DishOrderStatus',
  },
  [PostgreSQLTable.Employee]: {
    status: 'Status',
  },
  [PostgreSQLTable.EmployeePosition]: {
    status: 'Status',
  },
  [PostgreSQLTable.EmployeeDepartment]: {
    status: 'Status',
  },
  [PostgreSQLTable.Kitchen]: {
    status: 'Status',
  },
  [PostgreSQLTable.KitchenLog]: {
    status: 'Status',
    action: 'KitchenActionEnum',
  },
  [PostgreSQLTable.Order]: {
    status: 'Status',
    orderSessionStatus: 'OrderSessionStatus',
  },
  [PostgreSQLTable.OrderSession]: {
    status: 'OrderSessionStatus',
  },
  [PostgreSQLTable.PaymentDetail]: {
    paymentMethod: 'PaymentMethodEnum',
  },
  [PostgreSQLTable.ReturnedDishOrder]: {
    status: 'DishOrderStatus',
  },
  [PostgreSQLTable.Shop]: {
    status: 'Status',
    dishPriceRoundingType: 'RoundingPaymentType',
    discountRoundingType: 'RoundingPaymentType',
    taxRoundingType: 'RoundingPaymentType',
  },
  [PostgreSQLTable.Table]: {
    status: 'Status',
  },
  [PostgreSQLTable.TablePosition]: {
    status: 'Status',
  },
  [PostgreSQLTable.Token]: {
    type: 'TokenType',
  },
  [PostgreSQLTable.Unit]: {
    status: 'Switchabletatus',
  },
  [PostgreSQLTable.User]: {
    role: 'Role',
    status: 'Status',
  },
};

const deleteCacheForBulkUpdate = async ({ tableName, entries }) => {
  try {
    if (tableName === PostgreSQLTable.User) {
      await Promise.all(entries.map((user) => deleteUserCache({ userId: user.id })));
    }
    if (tableName === PostgreSQLTable.User) {
      await Promise.all(entries.map((user) => deleteUserCache({ userId: user.id })));
    }
    if (tableName === PostgreSQLTable.Shop) {
      await Promise.all(entries.map((shop) => deleteShopCache({ shopId: shop.id })));
    }
    if (tableName === PostgreSQLTable.Customer) {
      await Promise.all(entries.map((customer) => deleteCustomerCache({ customerId: customer.id })));
    }
    if (tableName === PostgreSQLTable.Dish) {
      const dish = await prisma.dish.findUnique({
        where: {
          id: entries[0].id,
        },
        select: {
          shopId: true,
        },
      });
      if (!dish) return;
      await deleteMenuCache({ shopId: dish.shopId });
    }
    if (tableName === PostgreSQLTable.DishCategory) {
      const dishCategory = await prisma.dishCategory.findUnique({
        where: {
          id: entries[0].id,
        },
        select: {
          shopId: true,
        },
      });
      if (!dishCategory) return;
      await deleteMenuCache({ shopId: dishCategory.shopId });
    }
    if (tableName === PostgreSQLTable.Table) {
      const table = await prisma.table.findUnique({
        where: {
          id: entries[0].id,
        },
        select: {
          shopId: true,
        },
      });
      if (!table) return;
      await deleteTableCache({ shopId: table.shopId });
    }
    if (tableName === PostgreSQLTable.TablePosition) {
      const tablePosition = await prisma.tablePosition.findUnique({
        where: {
          id: entries[0].id,
        },
        select: {
          shopId: true,
        },
      });
      if (!tablePosition) return;
      await deleteTablePositionCache({ shopId: tablePosition.shopId });
    }
    if (tableName === PostgreSQLTable.Unit) {
      const unit = await prisma.unit.findUnique({
        where: {
          id: entries[0].id,
        },
        select: {
          shopId: true,
        },
      });
      if (!unit) return;
      await deleteUnitCache({ shopId: unit.shopId });
    }
    if (tableName === PostgreSQLTable.Employee) {
      const employee = await prisma.employee.findUnique({
        where: {
          id: entries[0].id,
        },
        select: {
          shopId: true,
        },
      });
      if (!employee) return;
      await deleteEmployeeCache({ shopId: employee.shopId });
      await deleteEmployeeByUserIdCache({ shopId: employee.shopId });
    }
    if (tableName === PostgreSQLTable.EmployeePosition) {
      const employeePosition = await prisma.employeePosition.findUnique({
        where: {
          id: entries[0].id,
        },
        select: {
          shopId: true,
        },
      });
      if (!employeePosition) return;
      await deleteEmployeePositionCache({ shopId: employeePosition.shopId });
    }
    if (tableName === PostgreSQLTable.EmployeeDepartment) {
      const employeeDepartment = await prisma.employeeDepartment.findUnique({
        where: {
          id: entries[0].id,
        },
        select: {
          shopId: true,
        },
      });
      if (!employeeDepartment) return;
      await deleteDepartmentCache({ shopId: employeeDepartment.shopId });
      await deleteEmployeeByUserIdCache({ shopId: employeeDepartment.shopId });
    }
    if (tableName === PostgreSQLTable.Kitchen) {
      const kitchen = await prisma.kitchen.findUnique({
        where: {
          id: entries[0].id,
        },
        select: {
          shopId: true,
        },
      });
      if (!kitchen) return;
      await deleteDepartmentCache({ shopId: kitchen.shopId });
    }
  } catch (err) {
    logger.error(`error deleteCacheForBulkUpdate. ${err}`);
  }
};

/**
 * Bulk update for prisma
 * Only accept primitive values and array
 */
const bulkUpdate = async (tableName, entries) => {
  if (entries.length === 0) return prisma.$executeRawUnsafe(`SELECT 1;`);

  const sanitizedTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
  const fields = Object.keys(entries[0]).filter((key) => key !== 'id');

  const setSql = fields.map((field) => `"${field}" = data."${field}"`).join(', ');

  const valuesSql = entries
    .map((entry) => {
      const values = fields.map((field) => {
        const value = entry[field];
        if (Array.isArray(value)) {
          if (value.length === 0) {
            // Handle empty arrays with explicit type casting
            // Common types: text[], integer[], boolean[], etc.
            return `ARRAY[]::text[]`; // Only works for String[]
          }

          // Determine array type based on first element
          const firstElement = value[0];
          let arrayType = 'text[]'; // default

          if (typeof firstElement === 'number') {
            arrayType = Number.isInteger(firstElement) ? 'integer[]' : 'numeric[]';
          } else if (typeof firstElement === 'boolean') {
            arrayType = 'boolean[]';
          } else if (firstElement instanceof Date) {
            arrayType = 'timestamp[]';
          }

          const formattedValues = value
            .map((v) => {
              if (typeof v === 'string') {
                return `'${v.replace(/'/g, "''")}'`;
              }
              if (v instanceof Date) {
                return `'${v.toISOString()}'`;
              }
              return v;
            })
            .join(', ');

          return `ARRAY[${formattedValues}]::${arrayType}`;
        }
        if (typeof value === 'string') {
          if (PostgreSQLEnumByTable[tableName] && PostgreSQLEnumByTable[tableName][field]) {
            // Cast string to enum
            // Enum type is wrapped inside "" to imply case-sensitive
            return `'${value.replace(/'/g, "''")}'::"${PostgreSQLEnumByTable[tableName][field]}"`;
          }
          return `'${value.replace(/'/g, "''")}'`;
        }
        if (value instanceof Date) {
          return `'${value.toISOString()}'`;
        }
        if (value === null || value === undefined) {
          return `NULL`;
        }
        return value;
      });
      return `('${entry.id}', ${values.join(', ')})`;
    })
    .join(', ');

  const sql = `
    UPDATE "${sanitizedTable}"
    SET ${setSql}
    FROM (VALUES ${valuesSql}) AS data(id, ${fields.map((field) => `"${field}"`).join(', ')})
    WHERE "${sanitizedTable}".id::text = data.id;
  `;

  const result = await prisma.$executeRawUnsafe(sql);
  await deleteCacheForBulkUpdate({
    tableName,
    entries,
  });
  return result;
};

module.exports = {
  prisma,
  bulkUpdate,
  PostgreSQLTable,
};
