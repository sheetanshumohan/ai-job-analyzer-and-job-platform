const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { analyzeAndApply } = require('../controllers/aiController');


router.post('/apply', auth, analyzeAndApply);

module.exports = router;        