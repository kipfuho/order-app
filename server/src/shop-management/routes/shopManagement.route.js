const express = require('express');
const multer = require('multer');
const httpStatus = require('http-status');
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
const paymentRoute = require('../../payment-management/routes/payment.route');
const suggestionRoute = require('../../suggestion-system/routes/suggestion.route');
const auth = require('../../middlewares/auth');
const { MAX_FILE_SIZE, PermissionType } = require('../../utils/constant');
const ApiError = require('../../utils/ApiError');
const { getMessageByLocale } = require('../../locale');

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
  {
    path: 'payment',
    route: paymentRoute,
  },
  {
    path: 'suggestion',
    route: suggestionRoute,
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

const upload = multer({
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new ApiError(httpStatus.BAD_REQUEST, getMessageByLocale('notImage')));
    }
    return cb(undefined, true);
  },
});

router.get('/:shopId', auth(PermissionType.VIEW_SHOP), shopManagementController.getShop);
router
  .route('/')
  .get(auth(PermissionType.VIEW_SHOP), shopManagementController.queryShop)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_SHOP), shopManagementController.createShop);
router.patch('/:shopId', auth(PermissionType.SHOP_APP, PermissionType.UPDATE_SHOP), shopManagementController.updateShop);
router.delete('/:shopId', auth(PermissionType.SHOP_APP, PermissionType.DELETE_SHOP), shopManagementController.deleteShop);
router.post(
  '/upload-image',
  auth(PermissionType.SHOP_APP, PermissionType.UPDATE_SHOP),
  upload.single('image'),
  shopManagementController.uploadImage
);
router.post(
  '/remove-image',
  auth(PermissionType.SHOP_APP, PermissionType.UPDATE_SHOP),
  shopManagementController.removeImage
);

module.exports = router;
