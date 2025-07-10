const router = require('express').Router();
const auth = require('../../../middlewares/adminAuth')
const userController = require('../../../controllers/admin/user.controller');

router.route('/add-user').post(auth, userController.userAdd);

module.exports = router;