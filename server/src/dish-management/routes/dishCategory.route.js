const express = require('express');
const dishCategoryController = require('../controllers/dishCategory.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:dishCategoryId', auth(), dishCategoryController.getDishCategory);
router
  .route('/')
  .get(auth(), dishCategoryController.getDishCategories)
  .post(auth(), dishCategoryController.createDishCategory);
router.patch('/:dishCategoryId', auth(), dishCategoryController.updateDishCategory);
router.delete('/:dishCategoryId', auth(), dishCategoryController.deleteDishCategory);
router.post('/import', auth(), dishCategoryController.importDishCategories);

module.exports = router;
