const express = require('express');
const multer = require('multer');
const httpStatus = require('http-status');
const dishController = require('../controllers/dish.controller');
const auth = require('../../middlewares/auth');
const { MAX_FILE_SIZE } = require('../../utils/constant');
const ApiError = require('../../utils/ApiError');
const { getMessageByLocale } = require('../../locale');

const router = express.Router();
const upload = multer({
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new ApiError(httpStatus.BAD_REQUEST, getMessageByLocale('notImage')));
    }
    return cb(undefined, true);
  },
});

router.get('/dishTypes', auth(), dishController.getDishTypes);
router.get('/:dishId', auth(), dishController.getDish);
router.route('/').get(auth(), dishController.getDishes).post(auth(), dishController.createDish);
router.patch('/:dishId', auth(), dishController.updateDish);
router.delete('/:dishId', auth(), dishController.deleteDish);
router.post('/upload', auth(), upload.single('image'), dishController.uploadImage);

module.exports = router;
