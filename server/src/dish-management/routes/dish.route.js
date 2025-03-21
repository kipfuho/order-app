const express = require('express');
const dishController = require('../controllers/dish.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/dishTypes', auth(), dishController.getDishTypes);
router.get('/:dishId', auth(), dishController.getDish);
router.route('/').get(auth(), dishController.getDishes).post(auth(), dishController.createDish);
router.patch('/:dishId', auth(), dishController.updateDish);
router.delete('/:dishId', auth(), dishController.deleteDish);

module.exports = router;
