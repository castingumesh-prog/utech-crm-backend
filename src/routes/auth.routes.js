const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  if (email === 'admin@utech.com' && password === 'admin123') {
    return res.json({
      success: true,
      message: 'Login successful',
      token: 'demo-jwt-token'
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

module.exports = router;
