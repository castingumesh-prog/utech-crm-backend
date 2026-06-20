const Razorpay = require('razorpay');
const crypto = require('node:crypto');
const pool = require('../config/db');
const saveAuditLog = require('../services/saveAuditLog');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

exports.createOrder = async (req, res, next) => {
  try {
    const { quotation_id, amount_paise } = req.body;
    if (!quotation_id || !amount_paise) {
      return res.status(400).json({ success: false, message: 'quotation_id and amount_paise are required' });
    }

    if (!razorpay) {
      return res.json({ success: true, mock: true, order_id: `mock_order_${Date.now()}`, amount: amount_paise });
    }

    const order = await razorpay.orders.create({
      amount: Number(amount_paise),
      currency: 'INR',
      receipt: `QT-${quotation_id}-${Date.now()}`,
    });

    await saveAuditLog({
      userId: req.user?.id || null,
      moduleName: 'payments',
      action: 'ORDER_CREATED',
      recordId: quotation_id,
      newData: { order_id: order.id, amount: amount_paise },
    });

    res.json({ success: true, order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, quotation_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

    const a = Buffer.from(razorpay_signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    if (quotation_id) {
      await pool.query('UPDATE quotations SET status = ? WHERE id = ?', ['ACCEPTED', quotation_id]);
    }

    await saveAuditLog({
      userId: req.user?.id || null,
      moduleName: 'payments',
      action: 'PAYMENT_VERIFIED',
      recordId: quotation_id || null,
      newData: { razorpay_order_id, razorpay_payment_id },
    });

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    next(err);
  }
};
