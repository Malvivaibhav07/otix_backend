const router = require('express').Router();
const auth = require('../../../middlewares/adminAuth')
const productController = require('../../../controllers/admin/productController');

router.route('/add-product').post(auth, productController.addProduct);

module.exports = router;