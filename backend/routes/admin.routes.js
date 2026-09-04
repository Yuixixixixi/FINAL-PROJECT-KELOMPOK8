const router = require('express').Router();
const { login, register, me } = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', requireAuth, me);

module.exports = router;
