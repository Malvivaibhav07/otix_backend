const router = require('express').Router();
const userController = require('../../../controllers/user/userController');
const auth = require('../../../middlewares/userAuth')

router.route('/get-user-profile').get(auth, userController.getUserProfile);

module.exports = router;