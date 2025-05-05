const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    REDIS_HOST: Joi.string().required().description('Redis host'),
    REDIS_PORT: Joi.string().required().description('Redis port'),
    JOB_KEY: Joi.string().required().description('Job key'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    CUSTOMER_APPID: Joi.string().description('appid for customer request'),
    SHOP_APPID: Joi.string().description('appid for shop request'),
    AWS_REGION: Joi.string().description('aws region'),
    AWS_ACCESS_KEY_ID: Joi.string().description('aws access key id'),
    AWS_SECRET_ACCESS_KEY: Joi.string().description('aws secret access key'),
    AWS_S3_BUCKET_NAME: Joi.string().description('aws s3 bucket name'),
    AWS_APPSYNC_HTTP: Joi.string().description('aws appsync http endpoint'),
    AWS_APPSYNC_API_KEY: Joi.string().description('aws appsync api key'),
    VNPAY_TERMINAL_ID: Joi.string().description('vnpay terminal id'),
    VNPAY_SECRET: Joi.string().description('vnpay hash secret'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      maxPoolSize: 100,
    },
  },
  redisHost: envVars.REDIS_HOST,
  redisPort: envVars.REDIS_PORT,
  jobKey: envVars.JOB_KEY,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  appid: {
    customer: envVars.CUSTOMER_APPID,
    shop: envVars.SHOP_APPID,
  },
  aws: {
    region: envVars.AWS_REGION,
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    s3BucketName: envVars.AWS_S3_BUCKET_NAME,
    appsyncHttp: envVars.AWS_APPSYNC_HTTP,
    appsyncApiKey: envVars.AWS_APPSYNC_API_KEY,
  },
  vnpay: {
    terminalId: envVars.VNPAY_TERMINAL_ID,
    secret: envVars.VNPAY_SECRET,
  },
};
