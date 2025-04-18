const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../../utils/ApiError');
const { tokenTypes } = require('../../config/tokens');
const { getUserFromDatabase, getUserFromCache, getUserModelFromDatabase } = require('../../metadata/userMetadata.service');
const { getCustomerFromCache, getCustomerFromDatabase } = require('../../metadata/customerMetadata.service');

const _getUserFromRefreshToken = async (tokenDoc) => {
  if (!tokenDoc.isCustomer) {
    return getUserFromCache({ userId: tokenDoc.user });
  }
  return getCustomerFromCache({ userId: tokenDoc.user });
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
const compareUserPassword = async (user, password) => {
  if (!user) {
    return false;
  }
  return bcrypt.compare(password, user.password);
};

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async ({ email, password }) => {
  const user = await getUserModelFromDatabase({ email });
  const isPasswordMatch = await compareUserPassword(user, password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  // delete all previous refresh tokens
  await Token.deleteMany({ user: user.id, type: tokenTypes.REFRESH });
  return user;
};

/**
 * Login customer with phone and password
 * @param {string} phone
 * @param {string} password
 * @returns {Promise<Customer>}
 */
const loginCustomerWithPhoneAndPassword = async ({ phone, password }) => {
  const customer = await getCustomerFromDatabase({ phone });
  const isPasswordMatch = await compareUserPassword(customer, password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect phone or password');
  }

  // delete all previous refresh tokens
  await Token.deleteMany({ user: customer.id, type: tokenTypes.REFRESH });
  return customer;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await Token.deleteOne({ _id: refreshTokenDoc._id });
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await _getUserFromRefreshToken(refreshTokenDoc);
    if (!user) {
      throw new Error();
    }
    await Token.deleteOne({ _id: refreshTokenDoc._id });
    return tokenService.generateAuthTokens(user, refreshTokenDoc.isCustomer);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await _getUserFromRefreshToken(resetPasswordTokenDoc);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await _getUserFromRefreshToken(verifyEmailTokenDoc);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Check user by email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const checkUserExistByEmail = async ({ email }) => {
  const user = await getUserFromDatabase({ email });
  return !!user;
};

module.exports = {
  loginUserWithEmailAndPassword,
  loginCustomerWithPhoneAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  checkUserExistByEmail,
};
