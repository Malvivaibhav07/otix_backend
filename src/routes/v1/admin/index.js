const router = require('express').Router();
const productRoute = require('./product.route');
const customerRoute = require('./customer.route');
const authRoute = require('./auth.route');
const userRoute = require('./user.route')
const finishingRoute = require('./finishing.route')

const defaultRoutes = [
  {
        path: '/',
        route: authRoute,
      }
      ,
    {
        path: '/',
        route: productRoute,
      },
       {
        path: '/',
        route: customerRoute,
      },
       {
        path: '/',
        route: userRoute,
      },
       {
        path: '/',
        route: finishingRoute,
      }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
  
  
  module.exports = router;