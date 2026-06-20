const express = require('express');
const crypto = require('node:crypto');
const { handleIncomingWhatsApp } = require('../services/whatsappService');
const router = express.Router();

// Meta webhook verification (GET)
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode !== 'subscribe' || !token) return res.sendStatus(403);

  const expected = process.env.WEBHOOK_VERIFY_TOKEN || '';
  const a = Buffer.from(token);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.sendStatus(403);
  }

  res.status(200).send(challenge);
});

// Meta webhook incoming messages (POST)
router.post('/whatsapp', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return res.sendStatus(403);

  const expected = 'sha256=' + crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET || '')
    .update(req.rawBody)
    .digest('hex');

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.sendStatus(403);
  }

  // Acknowledge immediately — Meta requires fast 200 response
  res.sendStatus(200);

  // Process async without blocking response
  handleIncomingWhatsApp(req.body).catch(err =>
    console.error('[Webhook] handleIncomingWhatsApp error:', err)
  );
});

module.exports = router;
