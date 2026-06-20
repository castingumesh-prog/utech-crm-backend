const pool = require('../config/db');

async function saveAuditLog({
  userId,
  moduleName,
  action,
  recordId,
  oldData,
  newData,
}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs
      (
        user_id,
        module_name,
        action,
        record_id,
        old_data,
        new_data
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        moduleName || 'unknown',
        action || 'UNKNOWN',
        recordId || null,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
      ]
    );
  } catch (error) {
    console.error('CRITICAL: Audit log save failed:', error);
    throw error; // Propagate the error so that the calling controller transaction can fail/rollback if audit log fails
  }
}

module.exports = saveAuditLog;

