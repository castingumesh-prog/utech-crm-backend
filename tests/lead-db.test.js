const pool = require('../src/config/db');

describe('Lead Persistence', () => {
  test('Insert Lead', async () => {
    let result;
    try {
      [result] = await pool.query(
        `INSERT INTO leads (lead_code, name, mobile) VALUES (?, ?, ?)`,
        [`TEST-${Date.now()}`, 'Test Lead', '9999999999']
      );
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.warn('MySQL unavailable – skipping lead persistence test');
        return;
      }
      throw err;
    }
    expect(result.insertId).toBeGreaterThan(0);
  });
});
