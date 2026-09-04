const router = require('express').Router();
const ctrl = require('../controllers/knowledge.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Semua endpoint manajemen pengetahuan bot memerlukan login panitia
router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/categories', ctrl.categories);
router.get('/:id', ctrl.detail);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/variants', ctrl.addVariant);
router.delete('/:id/variants/:variantId', ctrl.removeVariant);

module.exports = router;
