const router = require('express').Router();
const ctrl = require('../controllers/unanswered.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/', ctrl.list);
router.patch('/:id/status', ctrl.updateStatus);
router.post('/:id/convert', ctrl.convertToKnowledge);

module.exports = router;
