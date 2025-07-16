const router = require('express').Router();
const authRoute = require('./auth.route');
const userRoute = require('./user.route')

const defaultRoutes = [
    {
        path: '/',
        route: authRoute,
      },
    {
        path: '/',
        route: userRoute,
      }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
  
  
  module.exports = router;