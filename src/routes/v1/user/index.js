const router = require('express').Router();
const authRoute = require('./auth.route');

const defaultRoutes = [
    {
        path: '/',
        route: authRoute,
      }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
  
  
  module.exports = router;