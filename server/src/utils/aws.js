const _ = require('lodash');
const sharp = require('sharp');
const AWS = require('@aws-sdk/client-s3');
const axios = require('axios');
const https = require('node:https');
const { NodeHttpHandler } = require('@smithy/node-http-handler');
const logger = require('../config/logger');
const config = require('../config/config');
const { ALLOWED_IMAGE_MIME_TYPES, MAX_FILE_SIZE } = require('./constant');
const { throwBadRequest } = require('./errorHandling');
const { getMessageByLocale } = require('../locale');
const { S3Log } = require('../models');
const { getClientIdFromSession } = require('../middlewares/clsHooked');

const { region, accessKeyId, secretAccessKey, s3BucketName } = config.aws;
const s3BaseUrl = `https://${s3BucketName}.s3.${region}.amazonaws.com`;
const s3 = new AWS.S3({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  requestHandler: new NodeHttpHandler({
    requestTimeout: 10000,
    httpsAgent: new https.Agent({
      maxSockets: 100,
    }),
  }),
});

const _resizeAndCompressImageBuffer = async (imageBuffer) => {
  const resizeOptions = {
    width: 700,
    height: 700,
    fit: sharp.fit.inside,
    withoutEnlargement: true,
  };

  try {
    return await sharp(imageBuffer).resize(resizeOptions).withMetadata().jpeg({ quality: 80, progressive: true }).toBuffer();
  } catch (error) {
    logger.error('Image processing failed:', error);
    return imageBuffer;
  }
};

const getS3ObjectKey = (url) => {
  try {
    const key = _.replace(url, `${s3BaseUrl}/`, '');
    return key;
  } catch (err) {
    return url;
  }
};

const uploadImageBufferToS3 = async ({ fileBuffer, targetFilePath, mimeType, shouldRetainImageQuality = false }) => {
  try {
    throwBadRequest(fileBuffer.length > MAX_FILE_SIZE, getMessageByLocale({ key: 'fileTooLarge' }));
    throwBadRequest(!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType), getMessageByLocale({ key: 'notImage' }));

    let imageBuffer = fileBuffer;
    let imageMimeType = mimeType;
    if (!shouldRetainImageQuality) {
      imageBuffer = await _resizeAndCompressImageBuffer(fileBuffer);
      imageMimeType = 'image/jpeg';
    }

    const params = {
      Bucket: s3BucketName,
      Key: targetFilePath,
      Body: imageBuffer,
      ContentType: imageMimeType,
    };
    // Uploading files to the bucket
    await s3.putObject(params);
    // create log for object
    await S3Log.create({
      data: {
        key: targetFilePath,
      },
    });

    const resultUrl = `${s3BaseUrl}/${targetFilePath}`;
    return resultUrl;
  } catch (err) {
    logger.error(`Error deleting file: ${err.message}`);
    throw err;
  }
};

const deleteObjectFromS3 = async (key, persistLog = false) => {
  try {
    const params = {
      Bucket: s3BucketName,
      Key: key,
    };

    await s3.deleteObject(params);
    if (!persistLog) {
      await S3Log.delete({
        where: {
          key,
        },
        select: { id: true },
      });
    }

    return true;
  } catch (err) {
    logger.error(`Error deleting file: ${err.message}`);
    throw err;
  }
};

const publishAppSyncEvents = async ({ channel, events }) => {
  if (config.env === 'test') return;

  try {
    logger.debug(`publish event to channel: ${channel}. events=${JSON.stringify(events)}`);
    await axios.post(
      `${config.aws.appsyncHttp}/event`,
      {
        channel,
        events: _.map(events, (e) => JSON.stringify(e)),
      },
      {
        headers: {
          'x-api-key': config.aws.appsyncApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return true;
  } catch (error) {
    logger.error('Error publishing AppSync event:', error);
  }
};

const publishSingleAppSyncEvent = async ({ channel, event }) => {
  const clientId = getClientIdFromSession();
  // eslint-disable-next-line no-param-reassign
  event.clientId = clientId;

  return publishAppSyncEvents({
    channel,
    events: [event],
  });
};

module.exports = {
  getS3ObjectKey,
  uploadImageBufferToS3,
  deleteObjectFromS3,
  publishAppSyncEvents,
  publishSingleAppSyncEvent,
};
