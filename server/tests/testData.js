const { DishTypes } = require('../src/utils/constant');

const users = [
  {
    name: 'Savora',
    email: 'savora@gmail.com',
    password: 'savora123',
  },
];

const shops = [
  {
    name: 'Savora',
    email: 'savora@gmail.com',
    taxRate: 0,
  },
  {
    name: 'Savora 1',
    email: 'savora@gmail.com',
    taxRate: 8,
  },
];

const dishCategories = [
  {
    name: 'Danh mục 1',
    code: 'DM1',
  },
  {
    name: 'Danh mục 2',
    code: 'DM2',
  },
];

const dishes = [
  {
    name: 'Món rán 1',
    code: 'SP1',
    type: DishTypes.FOOD,
    price: 19000,
    isTaxIncludedPrice: false,
    taxRate: 0,
  },
  {
    name: 'Món rán 2',
    code: 'SP2',
    type: DishTypes.FOOD,
    price: 29000,
    isTaxIncludedPrice: false,
    taxRate: 8,
  },
  {
    name: 'Món rán 3',
    code: 'SP3',
    type: DishTypes.FOOD,
    price: 39000,
    isTaxIncludedPrice: false,
    taxRate: 10,
  },
  {
    name: 'Món rán 4',
    code: 'SP4',
    type: DishTypes.FOOD,
    price: 49000,
    isTaxIncludedPrice: true,
    taxRate: 8,
  },
  {
    name: 'Món rán 5',
    code: 'SP5',
    type: DishTypes.FOOD,
    price: 59000,
    isTaxIncludedPrice: true,
    taxRate: 10,
  },
];

const tablePositions = [
  {
    name: 'Khu vực 1',
    code: 'A1',
  },
];

const tables = [
  {
    name: 'Bàn 1',
    code: 'T1',
    allowMultipleOrderSession: false,
    needApprovalWhenCustomerOrder: false,
  },
  {
    name: 'Bàn 2',
    code: 'T2',
    allowMultipleOrderSession: true,
    needApprovalWhenCustomerOrder: true,
  },
];

const getUserData = () => users;

const getShopData = () => shops;

const getDishCategoryData = () => dishCategories;

const getDishData = () => dishes;

const getTablePositionData = () => tablePositions;

const getTableData = () => tables;

module.exports = {
  getUserData,
  getShopData,
  getDishCategoryData,
  getDishData,
  getTablePositionData,
  getTableData,
};
