const path = require('path');
const protobuf = require('protobufjs');
const logger = require('../../config/logger');
const { throwBadRequest } = require('../../utils/errorHandling');

const protoPath = path.join(__dirname, '../../../../protos/auth.proto');

const rootPromise = protobuf.load(protoPath).catch((err) => {
  console.error('Error loading protobuf:', err);
  process.exit(1);
});

async function getRoot() {
  return rootPromise;
}

const convertLoginRequest = async (req, res, next) => {
  const root = await getRoot();
  const message = root.lookupType('auth.LoginRequest');
  const decodedRequest = message.decode(Buffer.from(req.body));
  const err = message.verify(decodedRequest);
  if (err) {
    logger.error(`error convertLoginRequest. ${err}`);
    throwBadRequest(true, err);
  }
  req.body = decodedRequest.toJSON();
  next();
};

const convertLoginResponse = async ({ user, tokens }) => {
  const root = await getRoot();
  const message = root.lookupType('auth.LoginResponse');
  const response = message.create({
    user: {
      name: user.name,
      email: user.email,
    },
    tokens,
  });
  const err = message.verify(response);
  if (err) {
    logger.error(`error convertLoginResponse. ${err}`);
    throwBadRequest(true, err);
  }
  console.log(response.toJSON());
  return message.encode(response).finish();
};

module.exports = { convertLoginRequest, convertLoginResponse };
