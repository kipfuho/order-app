const httpStatus = require('http-status');
const ApiError = require('./ApiError');

const throwBadRequest = (condition, message) => {
  if (condition) {
    throw new ApiError(httpStatus.BAD_REQUEST, message);
  }
};

const throwServerError = (condition, message) => {
  if (condition) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, message);
  }
};

const throwUnauthorized = (condition, message) => {
  if (condition) {
    throw new ApiError(httpStatus.UNAUTHORIZED, message);
  }
};

module.exports = { throwBadRequest, throwServerError, throwUnauthorized };
