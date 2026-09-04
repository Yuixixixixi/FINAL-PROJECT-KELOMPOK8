const router = require('express').Router();
const { stats } = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/stats', requireAuth, stats);

module.exports = router;
