const pool = require('../config/db');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

exports.createProduct = async (req, res, next) => {
  try {
    const { product_code, name, description, price, gst_percent, stock_qty } = req.body;

    const [result] = await pool.query(
      'INSERT INTO products (product_code, name, description, price, gst_percent, stock_qty) VALUES (?, ?, ?, ?, ?, ?)',
      [product_code, name, description || null, Number(price), Number(gst_percent || 18), Number(stock_qty || 0)]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { limit, offset, page } = getPaginationParams(req.query);
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE name LIKE ? OR product_code LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?',
      [search, search, limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM products WHERE name LIKE ? OR product_code LIKE ?', [search, search]);
    res.json(formatPaginatedResponse(rows, total, page, limit));
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, gst_percent, stock_qty } = req.body;
    const [[existing]] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

    await pool.query(
      'UPDATE products SET name=?, description=?, price=?, gst_percent=?, stock_qty=? WHERE id=?',
      [
        name || existing.name,
        description || existing.description,
        price !== undefined ? Number(price) : existing.price,
        gst_percent !== undefined ? Number(gst_percent) : existing.gst_percent,
        stock_qty !== undefined ? Number(stock_qty) : existing.stock_qty,
        req.params.id,
      ]
    );
    res.json({ success: true, message: 'Product updated' });
  } catch (err) {
    next(err);
  }
};

exports.adjustStock = async (req, res, next) => {
  try {
    const { transaction_type, qty, remarks, reference_no } = req.body;
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const delta = transaction_type === 'IN' ? Number(qty) : -Number(qty);
    const newStock = product.stock_qty + delta;
    if (newStock < 0) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    await pool.query('UPDATE products SET stock_qty = ? WHERE id = ?', [newStock, req.params.id]);
    await pool.query(
      'INSERT INTO inventory_transactions (product_id, transaction_type, qty, remarks, reference_no, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, transaction_type, Number(qty), remarks || null, reference_no || null, req.user?.id || null]
    );

    res.json({ success: true, new_stock: newStock });
  } catch (err) {
    next(err);
  }
};
