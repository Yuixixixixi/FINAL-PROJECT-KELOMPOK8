const router = require('express').Router();
const { startSession, sendMessage, getSessionHistory } = require('../controllers/chat.controller');

// Akses publik — calon siswa/orang tua tidak perlu login (FR-1.2)
router.post('/session', startSession);
router.post('/message', sendMessage);
router.get('/session/:session_identifier/history', getSessionHistory);

module.exports = router;
