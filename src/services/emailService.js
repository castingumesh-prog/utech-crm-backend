const nodemailer = require('nodemailer');

/**
 * Send an email notification using SMTP.
 * If SMTP credentials are missing in the environment, it prints to standard output as a mock email.
 * @param {object} options - Email parameters (to, subject, text, html, attachments)
 * @returns {Promise<object>} SMTP sending result or mock response
 */
async function sendEmail({ to, subject, text, html, attachments }) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log(`\n--- [EMAIL MOCK OUTBOX] ---\nTO         : ${to}\nSUBJECT    : ${subject}\nATTACHMENTS: ${attachments ? attachments.map(a => a.filename).join(', ') : 'None'}\nTEXT       : ${text}\n---------------------------\n`);
    return { success: true, mock: true, message: 'Mock email printed to console successfully' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465, // true for port 465, false for others
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"U TECH Fire & Safety" <${user}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });

    return info;
  } catch (error) {
    console.error('SMTP Email sending error:', error.message);
    throw new Error(`SMTP Email sending failed: ${error.message}`);
  }
}

module.exports = {
  sendEmail,
};
