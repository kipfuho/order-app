const validator = require('validator');
const { User } = require('../../models');
const { getUserFromCache } = require('../../metadata/userMetadata.service');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');

const validateUser = (userBody) => {
  const errors = [];
  if (!userBody.name || typeof userBody.name !== 'string') {
    errors.push('Name is required and must be a string');
  }

  if (!userBody.email || !validator.isEmail(userBody.email)) {
    errors.push('A valid email is required');
  }

  if (userBody.phone && !validator.isMobilePhone(userBody.phone)) {
    errors.push('Invalid phone number');
  }

  if (!userBody.password || typeof userBody.password !== 'string') {
    errors.push('Password is required');
  } else {
    if (userBody.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!userBody.password.match(/\d/) || !userBody.password.match(/[a-zA-Z]/)) {
      errors.push('Password must contain at least one letter and one number');
    }
  }

  if (errors.length > 0) {
    throwBadRequest(true, errors.join(', '));
  }
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  validateUser(userBody);

  if (await User.isEmailTaken(userBody.email)) {
    throwBadRequest(true, getMessageByLocale({ key: 'email.alreadyTaken' }));
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
  validateUser(updateBody);
  const user = await getUserFromCache({ userId });
  throwBadRequest(!user, getMessageByLocale({ key: 'user.notFound' }));
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throwBadRequest(true, getMessageByLocale({ key: 'email.alreadyTaken' }));
  }
  await User.update({
    data: updateBody,
    where: {
      id: userId,
    },
  });
  return user;
};

module.exports = {
  createUser,
  updateUserById,
};
