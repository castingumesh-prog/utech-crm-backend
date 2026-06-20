const express = require('express');
const { body } = require('express-validator');
const { createQuotation, getQuotations, getQuotation } = require('../controllers/quotationController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  auth,
  [body('customer_id').notEmpty()],
  validate,
  createQuotation
);

router.get('/', auth, getQuotations);
router.get('/:id', auth, getQuotation);

module.exports = router;
