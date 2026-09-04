const { fail } = require('../utils/response');

function notFoundHandler(req, res) {
  return fail(res, `Route ${req.method} ${req.originalUrl} tidak ditemukan`, 404);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err);
  return fail(res, err.message || 'Kesalahan server internal', err.status || 500);
}

module.exports = { notFoundHandler, errorHandler };
