const twilio = require('twilio');

/**
 * Send an SMS to a customer's phone number using Twilio.
 * If Twilio credentials are not set, it logs a mock message to the console.
 * @param {string} to - Recipient phone number (with country code, e.g., '+919876543210')
 * @param {string} message - Text body content
 * @returns {Promise<object>} Twilio response or mock response object
 */
async function sendSMS(to, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log(`\n--- [SMS MOCK OUTBOX] ---\nTO     : ${to}\nMESSAGE: ${message}\n-------------------------\n`);
    return { success: true, mock: true, message: 'Mock SMS logged successfully' };
  }

  try {
    const client = twilio(accountSid, authToken);
    const response = await client.messages.create({
      body: message,
      to: to,
      from: fromNumber,
    });
    return response;
  } catch (error) {
    console.error('Twilio SMS API error:', error.message);
    throw new Error(`Twilio SMS API failed: ${error.message}`);
  }
}

module.exports = {
  sendSMS,
};
