const express = require('express');
const unitController = require('../controllers/unit.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.route('/').get(auth(), unitController.getUnits);
router.route('/create-default').get(auth(), unitController.createDefaultUnits);

module.exports = router;
