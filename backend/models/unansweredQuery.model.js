const db = require('../config/db');

const UnansweredQueryModel = {
  create({ chatMessageId, pertanyaan }) {
    const info = db
      .prepare('INSERT INTO unanswered_queries (chat_message_id, pertanyaan) VALUES (?, ?)')
      .run(chatMessageId, pertanyaan);
    return db.prepare('SELECT * FROM unanswered_queries WHERE id = ?').get(info.lastInsertRowid);
  },
  // Ikut sertakan similarity_score dari chat_messages terkait (hasil FR-2.1)
  // agar panitia bisa melihat seberapa dekat pertanyaan ini dengan skor tertinggi di KB.
  findAll({ status } = {}) {
    const base = `
      SELECT uq.*, cm.similarity_score
      FROM unanswered_queries uq
      LEFT JOIN chat_messages cm ON cm.id = uq.chat_message_id
    `;
    return status
      ? db.prepare(`${base} WHERE uq.status = ? ORDER BY uq.created_at DESC`).all(status)
      : db.prepare(`${base} ORDER BY uq.created_at DESC`).all();
  },
  findById(id) {
    return db.prepare('SELECT * FROM unanswered_queries WHERE id = ?').get(id);
  },
  updateStatus(id, status) {
    db.prepare('UPDATE unanswered_queries SET status = ? WHERE id = ?').run(status, id);
    return this.findById(id);
  },
  countByStatus() {
    return db
      .prepare('SELECT status, COUNT(*) as total FROM unanswered_queries GROUP BY status')
      .all();
  },
};

module.exports = UnansweredQueryModel;