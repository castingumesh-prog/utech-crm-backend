const express = require('express');
const router = express.Router();

router.post('/whatsapp', (req, res) => {
  const payload = req.body;

  if (!payload || !payload.messaging_product) {
    return res.status(400).json({ success: false, message: 'Invalid WhatsApp webhook payload' });
  }

  res.json({ success: true, message: 'WhatsApp webhook received', payload });
});

module.exports = router;
