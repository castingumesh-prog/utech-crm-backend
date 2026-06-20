const express = require('express');
const { body } = require('express-validator');
const { createWorkOrder, getWorkOrders, getWorkOrder, updateWorkOrderStatus } = require('../controllers/workOrderController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  auth,
  [body('customer_id').notEmpty()],
  validate,
  createWorkOrder
);

router.get('/', auth, getWorkOrders);
router.get('/:id', auth, getWorkOrder);
router.patch('/:id/status', auth, [body('status').notEmpty()], validate, updateWorkOrderStatus);

module.exports = router;
