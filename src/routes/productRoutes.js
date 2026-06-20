const express = require('express');
const { body } = require('express-validator');
const { createProduct, getProducts, getProduct, updateProduct, adjustStock } = require('../controllers/productController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/', auth, roleGuard(['Super Admin', 'Admin']), [body('product_code').notEmpty(), body('name').notEmpty(), body('price').isNumeric()], validate, createProduct);
router.get('/', auth, getProducts);
router.get('/:id', auth, getProduct);
router.put('/:id', auth, roleGuard(['Super Admin', 'Admin']), updateProduct);
router.post('/:id/stock', auth, roleGuard(['Super Admin', 'Admin', 'Sales Manager']), [body('transaction_type').isIn(['IN', 'OUT', 'ADJUSTMENT']), body('qty').isNumeric()], validate, adjustStock);

module.exports = router;
