const router = require('express').Router();
const auth = require('../../../middlewares/adminAuth')
const customerController = require('../../../controllers/admin/customerController');

router.route('/add-customer').post(auth, customerController.addCustomer);

module.exports = router;