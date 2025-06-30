const router = require('express').Router();
const auth = require('../../../middlewares/userAuth')
const customerController = require('../../../controllers/customer/customerController');

router.route('/add-customer').post(auth, customerController.addCustomer);

module.exports = router;