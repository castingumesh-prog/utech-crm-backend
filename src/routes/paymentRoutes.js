const express = require('express');
const { body } = require('express-validator');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/create-order', auth, [body('quotation_id').notEmpty(), body('amount_paise').isNumeric()], validate, createOrder);
router.post('/verify', auth, [body('razorpay_order_id').notEmpty(), body('razorpay_payment_id').notEmpty(), body('razorpay_signature').notEmpty()], validate, verifyPayment);

module.exports = router;
