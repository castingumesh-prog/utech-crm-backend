const pool = require('../config/db');
const saveAuditLog = require('../services/saveAuditLog');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

exports.createQuotation = async (req, res, next) => {
  try {
    const { customer_id, lead_id, quotation_date, items = [], status } = req.body;

    // Calculate totals from items
    let subtotal = 0;
    let gst_amount = 0;
    items.forEach(item => {
      const lineTotal = Number(item.qty) * Number(item.unit_price);
      subtotal += lineTotal;
      gst_amount += lineTotal * (Number(item.gst_percent || 18) / 100);
    });
    const total_amount = subtotal + gst_amount;

    await pool.query(
      'INSERT INTO sequence_counters (name, val) VALUES (\'quotation\', 1) ON DUPLICATE KEY UPDATE val = val + 1'
    );
    const [[counter]] = await pool.query('SELECT val FROM sequence_counters WHERE name = \'quotation\'');
    const year = new Date().getFullYear();
    const quotation_no = `UT-QT-${year}-${String(counter.val).padStart(6, '0')}`;

    const [result] = await pool.query(
      'INSERT INTO quotations (quotation_no, customer_id, lead_id, quotation_date, subtotal, gst_amount, total_amount, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        quotation_no,
        customer_id,
        lead_id || null,
        quotation_date || new Date(),
        subtotal.toFixed(2),
        gst_amount.toFixed(2),
        total_amount.toFixed(2),
        status || 'DRAFT',
        req.user?.id || null,
      ]
    );

    // Save line items
    if (items.length > 0) {
      const itemRows = items.map(item => {
        const lineTotal = Number(item.qty) * Number(item.unit_price);
        return [
          result.insertId,
          item.product_id || null,
          item.product_name || 'Custom Item',
          Number(item.qty),
          Number(item.unit_price),
          Number(item.gst_percent || 18),
          lineTotal.toFixed(2),
        ];
      });
      await pool.query(
        'INSERT INTO quotation_items (quotation_id, product_id, product_name, qty, unit_price, gst_percent, total) VALUES ?',
        [itemRows]
      );
    }

    await saveAuditLog({
      userId: req.user?.id || null,
      moduleName: 'quotations',
      action: 'CREATE',
      recordId: result.insertId,
      newData: { quotation_no, customer_id, total_amount },
    });

    // Generate PDF async (non-blocking)
    const { generateBrandedPDF } = require('../services/pdfService');
    generateBrandedPDF('Quotation', {
      no: quotation_no,
      date: new Date().toLocaleDateString(),
      customerName: customer_id,
      items,
      subtotal,
      gst_amount,
      total_amount,
    }).then(({ relativePath }) => {
      pool.query('UPDATE quotations SET pdf_path = ? WHERE id = ?', [relativePath, result.insertId]).catch(() => {});
    }).catch(err => console.error('[PDF] Generation error:', err));

    res.status(201).json({ success: true, id: result.insertId, quotation_no, total_amount });
  } catch (err) {
    next(err);
  }
};

exports.getQuotations = async (req, res, next) => {
  try {
    const { limit, offset, page } = getPaginationParams(req.query);
    const [rows] = await pool.query('SELECT * FROM quotations ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM quotations');
    res.json(formatPaginatedResponse(rows, total, page, limit));
  } catch (err) {
    next(err);
  }
};

exports.getQuotation = async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM quotations WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Quotation not found' });
    const [items] = await pool.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [req.params.id]);
    res.json({ ...row, items });
  } catch (err) {
    next(err);
  }
};
