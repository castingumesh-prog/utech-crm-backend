const pool = require('../config/db');
const saveAuditLog = require('../services/saveAuditLog');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

exports.createWorkOrder = async (req, res, next) => {
  try {
    const { customer_id, quotation_id, work_order_date, items = [], status, assigned_to } = req.body;

    await pool.query(
      'INSERT INTO sequence_counters (name, val) VALUES (\'work_order\', 1) ON DUPLICATE KEY UPDATE val = val + 1'
    );
    const [[counter]] = await pool.query('SELECT val FROM sequence_counters WHERE name = \'work_order\'');
    const year = new Date().getFullYear();
    const work_order_no = `UT-WO-${year}-${String(counter.val).padStart(6, '0')}`;

    // If linked to quotation, pull total from it
    let total_amount = 0;
    if (quotation_id) {
      const [[qt]] = await pool.query('SELECT total_amount FROM quotations WHERE id = ?', [quotation_id]);
      if (qt) total_amount = Number(qt.total_amount);
    }

    const [result] = await pool.query(
      'INSERT INTO work_orders (work_order_no, quotation_id, customer_id, work_order_date, total_amount, status, assigned_to, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        work_order_no,
        quotation_id || null,
        customer_id,
        work_order_date || new Date(),
        total_amount,
        status || 'OPEN',
        assigned_to || null,
        req.user?.id || null,
      ]
    );

    // Save work order items
    if (items.length > 0) {
      const itemRows = items.map(item => [
        result.insertId,
        item.product_id || null,
        item.product_name || 'Custom Task',
        Number(item.qty || 1),
        item.description || null,
      ]);
      await pool.query(
        'INSERT INTO work_order_items (work_order_id, product_id, product_name, qty, description) VALUES ?',
        [itemRows]
      );
    }

    await saveAuditLog({
      userId: req.user?.id || null,
      moduleName: 'work_orders',
      action: 'CREATE',
      recordId: result.insertId,
      newData: { work_order_no, customer_id, quotation_id },
    });

    res.status(201).json({ success: true, id: result.insertId, work_order_no });
  } catch (err) {
    next(err);
  }
};

exports.getWorkOrders = async (req, res, next) => {
  try {
    const { limit, offset, page } = getPaginationParams(req.query);
    const [rows] = await pool.query('SELECT * FROM work_orders ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM work_orders');
    res.json(formatPaginatedResponse(rows, total, page, limit));
  } catch (err) {
    next(err);
  }
};

exports.getWorkOrder = async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM work_orders WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Work order not found' });
    const [items] = await pool.query('SELECT * FROM work_order_items WHERE work_order_id = ?', [req.params.id]);
    const [tasks] = await pool.query('SELECT * FROM work_order_tasks WHERE work_order_id = ?', [req.params.id]);
    res.json({ ...row, items, tasks });
  } catch (err) {
    next(err);
  }
};

exports.updateWorkOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${valid.join(', ')}` });
    }
    await pool.query('UPDATE work_orders SET status = ? WHERE id = ?', [status, req.params.id]);
    await saveAuditLog({
      userId: req.user?.id || null,
      moduleName: 'work_orders',
      action: 'STATUS_CHANGE',
      recordId: req.params.id,
      newData: { status },
    });
    res.json({ success: true, message: `Work order status updated to ${status}` });
  } catch (err) {
    next(err);
  }
};
