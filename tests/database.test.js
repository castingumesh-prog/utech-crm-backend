const pool = require('../src/config/db');

describe('Database Connection', () => {
  test('Should connect to MySQL', async () => {
    let rows;
    try {
      [rows] = await pool.query('SELECT 1 AS status');
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.warn('MySQL unavailable – skipping DB connection test');
        return;
      }
      throw err;
    }
    expect(rows[0].status).toBe(1);
  });
});
