const router = require('express').Router();
const productRoute = require('./product.route');

const defaultRoutes = [
    {
        path: '/',
        route: productRoute,
      }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
  
  
  module.exports = router;