const router = require('express').Router();
const customerRoute = require('./customer.route');

const defaultRoutes = [
    {
        path: '/',
        route: customerRoute,
      }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
  
  
  module.exports = router;