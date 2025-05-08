const express = require('express');
const multer = require('multer');
const httpStatus = require('http-status');
const dishController = require('../controllers/dish.controller');
const auth = require('../../middlewares/auth');
const { MAX_FILE_SIZE, PermissionType } = require('../../utils/constant');
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
router.post(
  '/upload-image',
  auth(PermissionType.SHOP_APP, PermissionType.UPDATE_MENU),
  upload.single('image'),
  dishController.uploadImage
);
router.post('/import', auth(PermissionType.SHOP_APP, PermissionType.UPDATE_MENU), dishController.importDishes);

///
router
  .route('/:dishId')
  .get(auth(PermissionType.VIEW_MENU), dishController.getDish)
  .patch(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_MENU), dishController.updateDish)
  .delete(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_MENU), dishController.deleteDish);
router
  .route('/')
  .get(auth(PermissionType.VIEW_MENU), dishController.getDishes)
  .post(auth(PermissionType.SHOP_APP, PermissionType.UPDATE_MENU), dishController.createDish);

module.exports = router;
