const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../../config/config');
const { Token } = require('../../models');
const { tokenTypes } = require('../../config/tokens');
const { getUserFromDatabase } = require('../../metadata/userMetadata.service');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = ({ userId, clientId, expires, type, isCustomer = false, secret = config.jwt.secret }) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
    isCustomer,
    clientId,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async ({ token, userId, clientId, expires, type, isCustomer = false, blacklisted = false }) => {
  if (isCustomer) {
    const tokenDoc = await Token.create({
      data: {
        token,
        customerId: userId,
        clientId,
        expires: expires.toDate(),
        type,
        blacklisted,
        isCustomer,
      },
    });
    return tokenDoc;
  }
  const tokenDoc = await Token.create({
    data: {
      token,
      userId,
      clientId,
      expires: expires.toDate(),
      type,
      blacklisted,
      isCustomer,
    },
  });
  return tokenDoc;
};

const _checkTokenBelongToUser = ({ token, jwtPayload, clientId }) => {
  if (token.clientId !== clientId) return false;

  if (jwtPayload.isCustomer) {
    return jwtPayload.sub === token.customerId;
  }
  return jwtPayload.sub === token.userId;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type, clientId) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findFirst({
    where: {
      token,
      type,
    },
  });
  if (
    !tokenDoc ||
    !_checkTokenBelongToUser({
      token: tokenDoc,
      jwtPayload: payload,
      clientId,
    })
  ) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async ({ user, clientId, isCustomer = false }) => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes * (config.env === 'test' ? 1000 : 1),
    'minutes'
  );
  const accessToken = generateToken({
    userId: user.id,
    clientId,
    expires: accessTokenExpires,
    type: tokenTypes.ACCESS,
    isCustomer,
  });

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays * (isCustomer ? 1000 : 1), 'days');
  const refreshToken = generateToken({
    userId: user.id,
    clientId,
    expires: refreshTokenExpires,
    type: tokenTypes.REFRESH,
    isCustomer,
  });
  await saveToken({
    token: refreshToken,
    userId: user.id,
    clientId,
    expires: refreshTokenExpires,
    type: tokenTypes.REFRESH,
    isCustomer,
  });

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate().getTime(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate().getTime(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await getUserFromDatabase({ email });
  throwBadRequest(!user, getMessageByLocale({ key: 'user.notFound' }));
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken({ userId: user.id, clientId: '', expires, type: tokenTypes.RESET_PASSWORD });
  await saveToken({
    token: resetPasswordToken,
    userId: user.id,
    expires,
    type: tokenTypes.RESET_PASSWORD,
  });
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken({ userId: user.id, clientId: '', expires, type: tokenTypes.VERIFY_EMAIL });
  await saveToken({ token: verifyEmailToken, userId: user.id, expires, type: tokenTypes.VERIFY_EMAIL });
  return verifyEmailToken;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
};
