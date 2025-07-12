const router = require('express').Router();
const auth = require('../../../middlewares/adminAuth')
const customerController = require('../../../controllers/admin/customerController');

router.route('/add-customer').post(auth, customerController.addCustomerWithProducts);
router.route('/customer-list').get(auth, customerController.customerList);
router.route('/customer/:cust_id').get(auth, customerController.customerById);


module.exports = router;