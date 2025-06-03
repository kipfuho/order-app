const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const authConverter = require('../converters/auth.converter');
const customerService = require('../../customer-management/services/customerManagement.service');
const { getOperatorFromSession } = require('../../middlewares/clsHooked');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const registerForCustomer = catchAsync(async (req, res) => {
  const customer = await customerService.registerCustomer(req.body);
  const tokens = await tokenService.generateAuthTokens(customer, true);
  res.status(httpStatus.CREATED).send({ customer, tokens });
});

const loginWithProtobuf = catchAsync(async (req, res) => {
  const requestBody = req.body;
  const user = await authService.loginUserWithEmailAndPassword(requestBody);
  const tokens = await tokenService.generateAuthTokens(user);
  const response = await authConverter.convertLoginResponse({ user, tokens });
  res.send(response);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword({ email, password });
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const loginForAnonymousCustomer = catchAsync(async (req, res) => {
  const { customerId } = req.body;
  let customer;
  if (customerId) {
    customer = await customerService.getCustomer(customerId);
  } else {
    customer = await customerService.createCustomer({
      anonymous: true,
    });
  }
  const tokens = await tokenService.generateAuthTokens(customer, true);
  res.send({ customer, tokens });
});

const loginForCustomer = catchAsync(async (req, res) => {
  const { phone, password } = req.body;
  const customer = await authService.loginCustomerWithPhoneAndPassword({ phone, password });
  const tokens = await tokenService.generateAuthTokens(customer, true);
  res.send({ customer, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const checkUserExistByEmail = catchAsync(async (req, res) => {
  const exist = await authService.checkUserExistByEmail(req.body);
  res.send({ exist });
});

const getPermissions = catchAsync(async (req, res) => {
  const { permissions } = getOperatorFromSession();
  res.send({ permissions: permissions || [] });
});

module.exports = {
  register,
  loginWithProtobuf,
  login,
  loginForAnonymousCustomer,
  loginForCustomer,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  checkUserExistByEmail,
  registerForCustomer,
  getPermissions,
};
