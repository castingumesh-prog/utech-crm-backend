const pool = require('../config/db');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

exports.createFollowUp = async (req, res, next) => {
  try {
    const { lead_id, customer_id, follow_up_date, notes } = req.body;

    const [result] = await pool.query(
      'INSERT INTO follow_ups (lead_id, customer_id, follow_up_date, notes, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [lead_id || null, customer_id || null, follow_up_date, notes || null, 'PENDING', req.user?.id || null]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.getFollowUps = async (req, res, next) => {
  try {
    const { limit, offset, page } = getPaginationParams(req.query);
    const { status, lead_id, customer_id } = req.query;

    let where = 'WHERE 1=1';
    const params = [];
    if (status) { where += ' AND status = ?'; params.push(status); }
    if (lead_id) { where += ' AND lead_id = ?'; params.push(lead_id); }
    if (customer_id) { where += ' AND customer_id = ?'; params.push(customer_id); }

    const [rows] = await pool.query(
      `SELECT * FROM follow_ups ${where} ORDER BY follow_up_date ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM follow_ups ${where}`, params);
    res.json(formatPaginatedResponse(rows, total, page, limit));
  } catch (err) {
    next(err);
  }
};

exports.updateFollowUp = async (req, res, next) => {
  try {
    const { status, notes, follow_up_date } = req.body;
    const [[existing]] = await pool.query('SELECT * FROM follow_ups WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Follow-up not found' });

    await pool.query(
      'UPDATE follow_ups SET status=?, notes=?, follow_up_date=? WHERE id=?',
      [status || existing.status, notes || existing.notes, follow_up_date || existing.follow_up_date, req.params.id]
    );
    res.json({ success: true, message: 'Follow-up updated' });
  } catch (err) {
    next(err);
  }
};
