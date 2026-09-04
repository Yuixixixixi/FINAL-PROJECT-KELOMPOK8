const { ok } = require('../utils/response');

function getHealth(req, res) {
  return ok(res, {
    status: 'up',
    service: 'ppdb-chatbot-backend',
    timestamp: new Date().toISOString(),
  }, 'Server sehat');
}

module.exports = { getHealth };
