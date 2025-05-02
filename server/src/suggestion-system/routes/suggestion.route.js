const express = require('express');
const suggestionController = require('../controllers/suggestion.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/', auth(), suggestionController.getRecommendedDishes);

module.exports = router;
