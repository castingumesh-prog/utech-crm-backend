const pool = require('../config/db');

/**
 * Generate a transaction-safe sequential code/number (e.g. LEAD-000005, QUOT-000012).
 * @param {string} sequenceName - Identifier for the counter (e.g. 'LEAD', 'CUST', 'QUOT', 'PI', 'WO', 'AMC', 'NOC')
 * @param {string} prefix - The prefix to append before the sequence (e.g. 'LEAD', 'CUST')
 * @returns {Promise<string>} Sequential number generated
 */
async function getNextSequenceValue(sequenceName, prefix) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Select the record FOR UPDATE to lock the row and prevent concurrent select race conditions
    const [rows] = await connection.query(
      'SELECT val FROM sequence_counters WHERE name = ? FOR UPDATE',
      [sequenceName]
    );

    let nextVal = 1;
    if (rows.length === 0) {
      await connection.query(
        'INSERT INTO sequence_counters (name, val) VALUES (?, ?)',
        [sequenceName, 1]
      );
    } else {
      nextVal = Number(rows[0].val) + 1;
      await connection.query(
        'UPDATE sequence_counters SET val = ? WHERE name = ?',
        [nextVal, sequenceName]
      );
    }

    await connection.commit();
    const paddedVal = String(nextVal).padStart(6, '0');
    return `${prefix}-${paddedVal}`;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  getNextSequenceValue,
};
