const httpStatus = require('http-status');
const { User } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getUserFromCache } = require('../../metadata/userMetadata.service');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserFromCache({ userId });
  throwBadRequest(!user, getMessageByLocale({ key: 'user.notFound' }));
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

module.exports = {
  createUser,
  updateUserById,
};
