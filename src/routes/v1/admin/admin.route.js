const router = require('express').Router();
const adminController = require('../../../controllers/admin/admin.controller');
const auth = require('../../../middlewares/adminAuth')

router.route('/get-admin-profile').get(auth, adminController.getAdminProfile);
router.route('/generate-full-bill').post( adminController.generateFullBillPDF);
router.route('/generate-weight-bill').post( adminController.generateWeightBillPDF);


module.exports = router;