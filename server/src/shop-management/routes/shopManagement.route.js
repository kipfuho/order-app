const express = require('express');
const shopManagementController = require('../controllers/shopManagement.controller');
const tableRoute = require('./table.route');
const tablePositionRoute = require('./tablePosition.route');
const employeeRoute = require('./employee.route');
const employeePositionRoute = require('./employeePosition.route');
const departmentRoute = require('./department.route');
const dishRoute = require('../../dish-management/routes/dish.route');
const dishCategoryRoute = require('../../dish-management/routes/dishCategory.route');
const unitRoute = require('../../dish-management/routes/unit.route');
const orderRoute = require('../../order-management/routes/orderManagement.route');
const auth = require('../../middlewares/auth');

const router = express.Router();

const defaultRoutes = [
  {
    path: 'tables',
    route: tableRoute,
  },
  {
    path: 'tablePositions',
    route: tablePositionRoute,
  },
  {
    path: 'employees',
    route: employeeRoute,
  },
  {
    path: 'employeePositions',
    route: employeePositionRoute,
  },
  {
    path: 'departments',
    route: departmentRoute,
  },
  {
    path: 'dishes',
    route: dishRoute,
  },
  {
    path: 'dishCategories',
    route: dishCategoryRoute,
  },
  {
    path: 'units',
    route: unitRoute,
  },
  {
    path: 'orders',
    route: orderRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(
    `/:shopId/${route.path}`,
    function (req, res, next) {
      req.shopId = req.params.shopId;
      next();
    },
    route.route
  );
});

router.get('/:shopId', auth(), shopManagementController.getShop);
router.route('/').get(auth(), shopManagementController.queryShop).post(auth(), shopManagementController.createShop);
router.patch('/:shopId', auth(), shopManagementController.updateShop);
router.delete('/:shopId', auth(), shopManagementController.deleteShop);

module.exports = router;
