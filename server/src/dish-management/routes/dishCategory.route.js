const express = require('express');
const dishCategoryController = require('../controllers/dishCategory.controller');
const auth = require('../../middlewares/auth');
const { PermissionType } = require('../../utils/constant');

const router = express.Router();

router.post(
  '/import',
  auth(PermissionType.SHOP_APP, PermissionType.UPDATE_MENU),
  dishCategoryController.importDishCategories
);

///
router
  .route('/:dishCategoryId')
  .get(auth(PermissionType.VIEW_MENU), dishCategoryController.getDishCategory)
  .patch(
    '/:dishCategoryId',
    auth(PermissionType.SHOP_APP, PermissionType.UPDATE_MENU),
    dishCategoryController.updateDishCategory
  )
  .delete(
    '/:dishCategoryId',
    auth(PermissionType.SHOP_APP, PermissionType.UPDATE_MENU),
    dishCategoryController.deleteDishCategory
  );
router
  .route('/')
  .get(auth(PermissionType.VIEW_MENU), dishCategoryController.getDishCategories)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_MENU), dishCategoryController.createDishCategory);

module.exports = router;
