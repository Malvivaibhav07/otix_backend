const router = require('express').Router();
const auth = require('../../../middlewares/adminAuth')
const finishingController = require('../../../controllers/admin/finishing.controller');

router.route('/add-finishing').post(auth, finishingController.addFinishing);
router.route('/edit-finishing/:f_id').put(auth, finishingController.editFinishing);
router.route('/delete-finishing/:f_id').delete(auth, finishingController.deleteFinishing);

module.exports = router;