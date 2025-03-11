const express = require('express');
const dishController = require('../controllers/dish.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:dishId', auth(), dishController.getDish);
router.post('/create', auth(), dishController.createDish);
router.patch('/:dishId', auth(), dishController.updateDish);
router.delete('/:dishId', auth(), dishController.deleteDish);

module.exports = router;
