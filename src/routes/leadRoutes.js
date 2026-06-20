const express = require('express');
const { body } = require('express-validator');
const { createLead, getLeads, getLead, updateLead } = require('../controllers/leadController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  auth,
  [body('name').notEmpty(), body('mobile').notEmpty()],
  validate,
  createLead
);

router.get('/', auth, getLeads);
router.get('/:id', auth, getLead);
router.put('/:id', auth, updateLead);

module.exports = router;
