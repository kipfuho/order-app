const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { getUserFromCache } = require('../metadata/userMetadata.service');
const { getCustomerFromCache } = require('../metadata/customerMetadata.service');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    let user;
    if (!payload.isCustomer) {
      user = await getUserFromCache({ userId: payload.sub });
    }
    if (payload.isCustomer) {
      user = await getCustomerFromCache({ customerId: payload.sub });
    }
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
