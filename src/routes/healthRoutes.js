const express = require('express');
const router = express.Router();
const checkDbHealth = require('../utils/dbHealth');

router.get('/db', async (req, res) => {
  const health = await checkDbHealth();

  if (!health.ok) {
    return res.status(500).json({
      success: false,
      database: 'disconnected',
      error: health.message,
      code: health.code,
    });
  }

  return res.json({
    success: true,
    database: 'connected',
    result: health.result,
  });
});

module.exports = router;
