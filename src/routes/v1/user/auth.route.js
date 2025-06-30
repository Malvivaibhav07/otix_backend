const router = require('express').Router();
const authController = require('../../../controllers/user/auth.controller');


// Define your user routes here
router.get('/', (req, res) => {
  res.send('User route works!');
});

router.route('/login').post(authController.login);
router.route('/signup').post(authController.signup);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/verify-otp').post(authController.verifyOtp);
router.route('/reset-password').post(authController.resetPassword);
router.route('/download-pdf').get(authController.downloadPdf);



module.exports = router;