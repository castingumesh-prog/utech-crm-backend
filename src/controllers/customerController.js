const pool = require('../config/db');
const { maskListContacts, maskEntityContacts } = require('../utils/contactMasking');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

exports.createCustomer = async (req, res, next) => {
  try {
    const { company_name, contact_person, mobile, email, address, lead_id } = req.body;

    await pool.query(
      'INSERT INTO sequence_counters (name, val) VALUES (\'customer\', 1) ON DUPLICATE KEY UPDATE val = val + 1'
    );
    const [[counter]] = await pool.query('SELECT val FROM sequence_counters WHERE name = \'customer\'');
    const year = new Date().getFullYear();
    const customer_code = `UT-CUS-${year}-${String(counter.val).padStart(6, '0')}`;

    const [result] = await pool.query(
      'INSERT INTO customers (customer_code, company_name, contact_person, mobile, email, address, lead_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_code, company_name, contact_person, mobile, email || null, address || null, lead_id || null]
    );

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, module_name, record_id) VALUES (?, ?, ?, ?)',
      [req.user?.id || null, 'CREATE', 'customers', result.insertId]
    );

    res.status(201).json({ success: true, id: result.insertId, customer_code });
  } catch (err) {
    next(err);
  }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const { limit, offset, page } = getPaginationParams(req.query);
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM customers');
    const safe = maskListContacts(rows, req.user.role);
    res.json(formatPaginatedResponse(safe, total, page, limit));
  } catch (err) {
    next(err);
  }
};

exports.getCustomer = async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json(maskEntityContacts(row, req.user.role));
  } catch (err) {
    next(err);
  }
};
