const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const getDish = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

const createDish = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

const updateDish = async (id) => {
  return User.findById(id);
};

const deleteDish = async (email) => {
  return User.findOne({ email });
};

const getDishes = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

module.exports = {
  getDish,
  createDish,
  updateDish,
  deleteDish,
  getDishes,
};
