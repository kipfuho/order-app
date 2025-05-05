const express = require('express');
const authRoute = require('./auth/routes/auth.route');
// const userRoute = require('./auth/routes/user.route');
const shopsRoute = require('./shop-management/routes/shopManagement.route');
const ipnRoute = require('./ipn/ipn.route');
const webhooksRoute = require('./webhooks/webhooks.route');

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
  {
    path: '/ipn',
    route: ipnRoute,
  },
  {
    path: '/webhooks',
    route: webhooksRoute,
  },
  // {
  //   path: '/users',
  //   route: userRoute,
  // },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
