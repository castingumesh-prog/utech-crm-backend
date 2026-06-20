const express = require('express');
const router = express.Router();

let quotations = [];

router.get('/', (req, res) => {
  res.json({ success: true, data: quotations });
});

router.post('/', (req, res) => {
  const { customer_id, total_amount } = req.body;

  if (!customer_id || !total_amount) {
    return res.status(400).json({ success: false, message: 'customer_id and total_amount are required' });
  }

  const quotation = {
    id: quotations.length + 1,
    quotation_no: `UT-QT-${String(quotations.length + 1).padStart(6, '0')}`,
    customer_id,
    total_amount,
    status: 'draft',
    created_at: new Date()
  };

  quotations.push(quotation);
  res.status(201).json({ success: true, data: quotation });
});

module.exports = router;
