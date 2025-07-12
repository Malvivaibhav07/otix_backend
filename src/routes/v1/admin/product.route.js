const router = require('express').Router();
const auth = require('../../../middlewares/adminAuth')
const productController = require('../../../controllers/admin/productController');

// router.route('/add-product').post(auth, productController.addProduct);
router.route('/product-list/:cust_id').get(auth, productController.productsBycustomerId);
router.route('/products/:p_id').get(auth, productController.productById);



module.exports = router;