const _ = require('lodash');
const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights, roles } = require('../config/roles');
const { appid } = require('../config/config');
const { getShopFromCache, getEmployeeFromCache } = require('../metadata/shopMetadata.service');

const getAppId = (req) => _.get(req, 'headers.appid') || '';
const isCustomerRequest = (req) => {
  const appId = getAppId(req);
  return appId.includes(appid.customer);
};

const isShopRequest = (req) => {
  const appId = getAppId(req);
  return appId.includes(appid.shop);
};

const _verifyAdmin = (req, requiredRights) => {
  const { user } = req;
  if (user.role === roles.admin && requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return false;
    }
  }
  return true;
};

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  try {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    req.user = user;

    if (!_verifyAdmin(req, requiredRights)) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }

    req.isCustomerRequest = isCustomerRequest(req);
    req.isShopRequest = isShopRequest(req);

    let { shopId } = req;
    if (!shopId) {
      shopId = req.params.shopId || _.get(req, 'body.shopId');
    }
    if (!shopId) {
      resolve();
      return;
    }

    const shop = await getShopFromCache({ shopId });
    req.shop = shop;

    if (shop.owner.toString() !== user.id) {
      const employee = await getEmployeeFromCache({ userId: user.id, shopId });
      if (!employee) {
        return reject(new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy nhân viên'));
      }
      req.employee = employee;
      const { permissions } = employee;
      const hasPermissions = requiredRights.every((right) => permissions.includes(right));
      if (!hasPermissions) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Không có đủ quyền'));
      }
    }

    resolve();
  } catch (error) {
    reject(error);
  }
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
