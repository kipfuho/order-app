const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const path = require('path');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { alsHooked } = require('./middlewares/clsHooked');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json({ limit: 1024 * 1024 }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.use(alsHooked);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

app.get('/', (req, res) => {
  res.send(`Express on Vercel. ENV=${config.env}`);
});

// serve static files
const staticFolder = path.join(__dirname, 'static');

app.get('/payment/success', function (_, res) {
  res.sendFile(`${staticFolder}/payment_success.html`, function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

app.get('/payment/failed', function (_, res) {
  res.sendFile(`${staticFolder}/payment_failed.html`, function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

app.get('/favicon.ico', function (_, res) {
  res.sendFile(`${staticFolder}/favicon.png`);
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
