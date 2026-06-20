const express = require('express');
const router = express.Router();

let leads = [];

router.get('/', (req, res) => {
  res.json({ success: true, data: leads });
});

router.post('/', (req, res) => {
  const { name, mobile, email, source } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({ success: false, message: 'Name and mobile are required' });
  }

  const lead = {
    id: leads.length + 1,
    lead_code: `UT-LD-${String(leads.length + 1).padStart(6, '0')}`,
    name,
    mobile,
    email: email || '',
    source: source || 'unknown',
    score: 0,
    status: 'new',
    created_at: new Date()
  };

  leads.push(lead);
  res.status(201).json({ success: true, data: lead });
});

module.exports = router;
