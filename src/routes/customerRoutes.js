const express = require('express');
const { body } = require('express-validator');
const { createCustomer, getCustomers, getCustomer } = require('../controllers/customerController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  auth,
  [
    body('company_name').notEmpty(),
    body('contact_person').notEmpty(),
    body('mobile').notEmpty(),
  ],
  validate,
  createCustomer
);

router.get('/', auth, getCustomers);
router.get('/:id', auth, getCustomer);

module.exports = router;
