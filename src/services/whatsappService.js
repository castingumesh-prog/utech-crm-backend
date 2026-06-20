const axios = require('axios');
const pool = require('../config/db');
const aiEngine = require('./aiEngine');

/**
 * Send a text message to a client using the Meta WhatsApp Business Cloud API.
 * Falls back to logging mock responses if credentials are not configured.
 * @param {string} to - Recipient phone number (with country code, e.g., '919876543210')
 * @param {string} text - Message body content
 * @returns {Promise<object>} Meta API response or mock response object
 */
async function sendWhatsAppMessage(to, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.log(`\n--- [WHATSAPP MOCK OUTBOX] ---\nTO     : ${to}\nMESSAGE: ${text}\n------------------------------\n`);
    return { success: true, mock: true, message: 'Mock sent successfully' };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { preview_url: false, body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    const errorData = error.response ? error.response.data : error.message;
    console.error('WhatsApp API sending error:', errorData);
    throw new Error(`WhatsApp API sending failed: ${JSON.stringify(errorData)}`);
  }
}

/**
 * Parse incoming webhook payloads from WhatsApp, analyze them, and automatically trigger replies.
 * Checks the database setting 'whatsapp_bot_enabled' before invoking AI chat engine auto-replies.
 * @param {object} payload - Incoming webhook request body from Meta
 */
async function handleIncomingWhatsApp(payload) {
  try {
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return; // Not a message event (could be a delivery status update)
    }

    const from = message.from; // Sender's phone number
    const textBody = message.text?.body;

    if (!textBody) {
      return; // We only handle incoming text messages in this bot version
    }

    // 1. Fetch 'whatsapp_bot_enabled' setting from database
    const [rows] = await pool.query(
      'SELECT setting_value FROM settings WHERE setting_key = ?',
      ['whatsapp_bot_enabled']
    );
    const botEnabled = rows[0] ? rows[0].setting_value === 'true' : true;

    if (!botEnabled) {
      console.log(`[WhatsApp Webhook] Incoming message from ${from}: "${textBody}" (Auto-reply bot disabled)`);
      return;
    }

    console.log(`[WhatsApp Webhook] Processing auto-reply for ${from}: "${textBody}"`);

    // 2. Generate natural language response via AI Engine
    const replyMessage = await aiEngine.generateResponse(textBody, from);

    // 3. Send the response back to the user
    await sendWhatsAppMessage(from, replyMessage);
  } catch (error) {
    console.error('Failed handling incoming WhatsApp webhook:', error);
  }
}

module.exports = {
  sendWhatsAppMessage,
  handleIncomingWhatsApp,
};
