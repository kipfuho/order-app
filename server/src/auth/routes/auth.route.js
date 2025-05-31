const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../controllers/auth.controller');
const auth = require('../../middlewares/auth');
const { convertLoginRequest } = require('../converters/auth.converter');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
// example of using protobuf
router.post(
  '/loginWithProtobuf',
  express.raw({ type: 'application/x-protobuf' }),
  convertLoginRequest,
  validate(authValidation.login),
  authController.loginWithProtobuf
);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/send-verification-email', auth(), authController.sendVerificationEmail);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
router.post('/check-user-by-email', auth(), authController.checkUserExistByEmail);
router.post('/login-for-anonymous-customer', authController.loginForAnonymousCustomer);
router.post('/login-for-customer', authController.loginForCustomer);
router.post('/register-for-customer', authController.registerForCustomer);

module.exports = router;
