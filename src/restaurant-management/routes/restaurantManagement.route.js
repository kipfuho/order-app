const express = require('express');
const restaurantManagementController = require('../controllers/restaurantManagement.controller');
const tableRoute = require('./table.route');
const tablePositionRoute = require('./tablePosition.route');
const employeeRoute = require('./employee.route');
const employeePositionRoute = require('./employeePosition.route');
const departmentRoute = require('./department.route');
const orderRoute = require('../../order-management/routes/orderManagement.route');
const auth = require('../../middlewares/auth');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/tables',
    route: tableRoute,
  },
  {
    path: '/tablePositions',
    route: tablePositionRoute,
  },
  {
    path: '/employees',
    route: employeeRoute,
  },
  {
    path: '/employeePositions',
    route: employeePositionRoute,
  },
  {
    path: '/departments',
    route: departmentRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

router.get('/:restaurantId', auth(), restaurantManagementController.getRestaurant);
router.post('/create', auth(), restaurantManagementController.createRestaurant);
router.patch('/:restaurantId', auth(), restaurantManagementController.updateRestaurant);
router.delete('/:restaurantId', auth(), restaurantManagementController.deleteRestaurant);

module.exports = router;
