const router = require('express').Router();
const ctrl = require('../controllers/botProfile.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', ctrl.getPublicProfile); // publik — dipakai widget chat
router.get('/admin', requireAuth, ctrl.getAdminProfile);
router.put('/admin', requireAuth, ctrl.updateProfile);

module.exports = router;
