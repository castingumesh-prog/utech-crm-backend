const express = require('express');
const { body } = require('express-validator');
const { createFollowUp, getFollowUps, updateFollowUp } = require('../controllers/followUpController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/', auth, [body('follow_up_date').notEmpty()], validate, createFollowUp);
router.get('/', auth, getFollowUps);
router.put('/:id', auth, updateFollowUp);

module.exports = router;
