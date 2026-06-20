const express = require('express');
const router = express.Router();

let customers = [];

router.get('/', (req, res) => {
  res.json({ success: true, data: customers });
});

router.post('/', (req, res) => {
  const { company_name, contact_person, mobile, email } = req.body;

  if (!company_name || !contact_person || !mobile) {
    return res.status(400).json({ success: false, message: 'Company name, contact person, and mobile are required' });
  }

  const customer = {
    id: customers.length + 1,
    customer_code: `UT-CU-${String(customers.length + 1).padStart(6, '0')}`,
    company_name,
    contact_person,
    mobile,
    email: email || '',
    address: req.body.address || '',
    created_at: new Date()
  };

  customers.push(customer);
  res.status(201).json({ success: true, data: customer });
});

module.exports = router;
