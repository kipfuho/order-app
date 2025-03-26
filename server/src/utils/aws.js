const _ = require('lodash');
const sharp = require('sharp');
const AWS = require('@aws-sdk/client-s3');
const logger = require('../config/logger');
const config = require('../config/config');
const { ALLOWED_IMAGE_MIME_TYPES, MAX_FILE_SIZE } = require('./constant');
const { throwBadRequest } = require('./errorHandling');
const { getMessageByLocale } = require('../locale');
const S3Log = require('../models/s3.model');

const { region, accessKeyId, secretAccessKey, s3BucketName } = config.aws;
const s3BaseUrl = `https://${s3BucketName}.s3.${region}.amazonaws.com`;
const s3 = new AWS.S3({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const _reziseImageBuffer = async (imageBuffer) => {
  const options = {
    width: 700,
    height: 700,
    fit: sharp.fit.inside,
    withoutEnlargement: true,
  };
  try {
    return await sharp(imageBuffer).resize(options).withMetadata().toBuffer();
  } catch (error) {
    logger.error(error.stack);
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

const uploadFileBufferToS3 = async ({ fileBuffer, targetFilePath, mimeType }) => {
  try {
    throwBadRequest(fileBuffer.length > MAX_FILE_SIZE, getMessageByLocale('fileTooLarge'));
    throwBadRequest(!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType), getMessageByLocale('notImage'));
    // Read content from the file
    const resizeContent = await _reziseImageBuffer(fileBuffer);

    const params = {
      Bucket: s3BucketName,
      Key: targetFilePath,
      Body: resizeContent,
      ContentType: mimeType,
    };
    // Uploading files to the bucket
    await s3.putObject(params);
    // create log for object
    await S3Log.create({ key: targetFilePath });

    const resultUrl = `${s3BaseUrl}/${targetFilePath}`;
    logger.debug(`upload file to ${resultUrl}`);
    return resultUrl;
  } catch (err) {
    logger.error(`Error deleting file: ${err.message}`);
    throw err;
  }
};

const deleteObjectFromS3 = async (key) => {
  try {
    const params = {
      Bucket: s3BucketName,
      Key: key,
    };

    await s3.deleteObject(params);
    await S3Log.deleteOne({ key });

    logger.debug(`Deleted file: ${key}`);
    return true;
  } catch (err) {
    logger.error(`Error deleting file: ${err.message}`);
    throw err;
  }
};

module.exports = {
  getS3ObjectKey,
  uploadFileBufferToS3,
  deleteObjectFromS3,
};
