const pool = require('../config/db');

async function checkDbHealth() {
  try {
    const [rows] = await pool.query('SELECT 1 AS status');
    return {
      ok: true,
      message: 'Database reachable',
      result: rows[0],
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message,
      code: error.code || null,
    };
  }
}

module.exports = checkDbHealth;
