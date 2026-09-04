const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { unauthorized } = require('../utils/response');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return unauthorized(res, 'Token tidak ditemukan, silakan login kembali');

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.admin = payload;
    next();
  } catch (err) {
    return unauthorized(res, 'Token tidak valid atau sudah kedaluwarsa');
  }
}

module.exports = { requireAuth };
