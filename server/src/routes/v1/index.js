const express = require('express');
const authRoute = require('../../auth/routes/auth.route');
// const userRoute = require('../../auth/routes/user.route');
const docsRoute = require('./docs.route');
const shopsRoute = require('../../shop-management/routes/shopManagement.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/shops',
    route: shopsRoute,
  },
  // {
  //   path: '/users',
  //   route: userRoute,
  // },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
