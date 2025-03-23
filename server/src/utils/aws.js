const sharp = require('sharp');
const AWS = require('@aws-sdk/client-s3');
const logger = require('../config/logger');
const config = require('../config/config');
const { ALLOWED_IMAGE_MIME_TYPES, MAX_FILE_SIZE } = require('./constant');
const { throwBadRequest } = require('./errorHandling');
const { getMessageByLocale } = require('../locale');

const { region, accessKeyId, secretAccessKey, s3BucketName } = config.aws;
const s3BaseUrl = `https://${config}.s3.${region}.amazonaws.com`;
const s3 = new AWS.S3Client({
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

const uploadFileBufferToS3 = async ({ fileBuffer, targetFilePath, mimeType }) => {
  throwBadRequest(fileBuffer.length > MAX_FILE_SIZE, getMessageByLocale('fileTooLarge'));
  throwBadRequest(!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType), getMessageByLocale('notImage'));
  // Read content from the file
  const resizeContent = await _reziseImageBuffer(fileBuffer);

  return new Promise((resolve, reject) => {
    const params = {
      Bucket: s3BucketName,
      Key: targetFilePath,
      Body: resizeContent,
      ContentType: mimeType,
    };
    // Uploading files to the bucket
    s3.putObject(params, (err) => {
      if (err) {
        reject(err);
      }
      const resultUrl = `${s3BaseUrl}/${targetFilePath}`;
      logger.debug(`upload file to ${resultUrl}`);
      resolve(resultUrl);
    });
  });
};

module.exports = {
  uploadFileBufferToS3,
};
