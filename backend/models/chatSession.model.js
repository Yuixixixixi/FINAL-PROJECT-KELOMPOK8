const db = require('../config/db');
const crypto = require('crypto');

const ChatSessionModel = {
  create() {
    const sessionIdentifier = crypto.randomUUID();
    const info = db
      .prepare('INSERT INTO chat_sessions (session_identifier) VALUES (?)')
      .run(sessionIdentifier);
    return { id: info.lastInsertRowid, session_identifier: sessionIdentifier };
  },
  findByIdentifier(identifier) {
    return db.prepare('SELECT * FROM chat_sessions WHERE session_identifier = ?').get(identifier);
  },
  findOrCreateByIdentifier(identifier) {
    if (identifier) {
      const existing = this.findByIdentifier(identifier);
      if (existing) return existing;
    }
    return this.create();
  },
  countAll() {
    return db.prepare('SELECT COUNT(*) as total FROM chat_sessions').get().total;
  },
  countInRange(sinceIso) {
    return db
      .prepare('SELECT COUNT(*) as total FROM chat_sessions WHERE created_at >= ?')
      .get(sinceIso).total;
  },
  trendByDay(days = 14) {
    return db
      .prepare(
        `SELECT date(created_at) as day, COUNT(*) as total
         FROM chat_sessions
         WHERE created_at >= datetime('now', ?)
         GROUP BY day
         ORDER BY day ASC`
      )
      .all(`-${days} days`);
  },
};

module.exports = ChatSessionModel;
