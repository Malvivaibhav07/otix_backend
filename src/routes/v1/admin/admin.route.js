const router = require('express').Router();
const adminController = require('../../../controllers/admin/admin.controller');
const auth = require('../../../middlewares/adminAuth')

router.route('/get-admin-profile').get(auth, adminController.getAdminProfile);

module.exports = router;