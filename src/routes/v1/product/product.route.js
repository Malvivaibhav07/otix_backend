const router = require('express').Router();
const auth = require('../../../middlewares/userAuth')
const productController = require('../../../controllers/product/productController');
console.log('auth',typeof auth)
router.route('/add-product').post(auth, productController.addProduct);

module.exports = router;