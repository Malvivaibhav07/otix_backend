const router = require('express').Router();
const authController = require('../../../controllers/user/auth.controller');

router.route('/login').post(authController.login);
router.route('/signup').post(authController.signup);


module.exports = router;