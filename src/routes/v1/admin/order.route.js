const router = require('express').Router();
const auth = require('../../../middlewares/adminAuth')
const orderController = require('../../../controllers/admin/order.controller');

router.route('/create-salesorder').post(auth,orderController.createSalesOrder);
router.route('/edit-sales-invoice/:order_id').put(auth, orderController.editSalesInvoice);
router.route('/delete-sales-invoice/:order_id').delete(auth, orderController.deleteSalesInvoice);
router.route('/sales-invoice-list').get(auth, orderController.salesInvoiceList);


module.exports = router;