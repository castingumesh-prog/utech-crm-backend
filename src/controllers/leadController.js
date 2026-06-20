const pool = require('../config/db');
const { maskListContacts, maskEntityContacts } = require('../utils/contactMasking');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

exports.createLead = async (req, res, next) => {
  try {
    const { name, mobile, email, source, requirement, budget } = req.body;

    await pool.query(
      'INSERT INTO sequence_counters (name, val) VALUES (\'lead\', 1) ON DUPLICATE KEY UPDATE val = val + 1'
    );
    const [[counter]] = await pool.query('SELECT val FROM sequence_counters WHERE name = \'lead\'');
    const lead_code = `LD-${String(counter.val).padStart(5, '0')}`;

    const [result] = await pool.query(
      'INSERT INTO leads (lead_code, name, mobile, email, source, status, score, requirement, budget) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [lead_code, name, mobile, email || null, source || 'Website', 'NEW', 0, requirement || null, budget || 0]
    );

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, module_name, record_id) VALUES (?, ?, ?, ?)',
      [req.user?.id || null, 'CREATE', 'leads', result.insertId]
    );

    res.status(201).json({ success: true, id: result.insertId, lead_code });
  } catch (err) {
    next(err);
  }
};

exports.getLeads = async (req, res, next) => {
  try {
    const { limit, offset, page } = getPaginationParams(req.query);
    const [rows] = await pool.query('SELECT * FROM leads ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM leads');
    const safe = maskListContacts(rows, req.user.role);
    res.json(formatPaginatedResponse(safe, total, page, limit));
  } catch (err) {
    next(err);
  }
};

exports.getLead = async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json(maskEntityContacts(row, req.user.role));
  } catch (err) {
    next(err);
  }
};

exports.updateLead = async (req, res, next) => {
  try {
    const { name, mobile, email, source, status, requirement, budget, score, assigned_to } = req.body;
    const [[existing]] = await pool.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Lead not found' });

    await pool.query(
      'UPDATE leads SET name=?, mobile=?, email=?, source=?, status=?, requirement=?, budget=?, score=?, assigned_to=? WHERE id=?',
      [
        name || existing.name,
        mobile || existing.mobile,
        email || existing.email,
        source || existing.source,
        status || existing.status,
        requirement || existing.requirement,
        budget || existing.budget,
        score || existing.score,
        assigned_to || existing.assigned_to,
        req.params.id,
      ]
    );

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, module_name, record_id) VALUES (?, ?, ?, ?)',
      [req.user?.id || null, 'UPDATE', 'leads', req.params.id]
    );

    res.json({ success: true, message: 'Lead updated' });
  } catch (err) {
    next(err);
  }
};
