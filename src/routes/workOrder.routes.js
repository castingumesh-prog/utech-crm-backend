const express = require('express');
const router = express.Router();

let workOrders = [];

router.get('/', (req, res) => {
  res.json({ success: true, data: workOrders });
});

router.post('/', (req, res) => {
  const { customer_id, quotation_id } = req.body;

  if (!customer_id) {
    return res.status(400).json({ success: false, message: 'customer_id is required' });
  }

  const workOrder = {
    id: workOrders.length + 1,
    work_order_no: `UT-WO-${new Date().getFullYear()}-${String(workOrders.length + 1).padStart(6, '0')}`,
    customer_id,
    quotation_id: quotation_id || null,
    status: 'open',
    created_at: new Date()
  };

  workOrders.push(workOrder);
  res.status(201).json({ success: true, data: workOrder });
});

module.exports = router;
