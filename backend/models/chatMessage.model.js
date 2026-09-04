const db = require('../config/db');

const ChatMessageModel = {
  create({ sessionId, pesanUser, matchedKnowledgeId, similarityScore, isAnswered }) {
    const info = db
      .prepare(
        `INSERT INTO chat_messages (session_id, pesan_user, matched_knowledge_id, similarity_score, is_answered)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(sessionId, pesanUser, matchedKnowledgeId || null, similarityScore, isAnswered ? 1 : 0);
    return db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(info.lastInsertRowid);
  },
  findBySession(sessionId) {
    return db
      .prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC')
      .all(sessionId);
  },
  // Pertanyaan populer: kelompokkan berdasarkan knowledge_id yang match (FR-5.1)
  popularQuestions(limit = 10, sinceIso = null) {
    const base = `
      SELECT kb.id as knowledge_id, kb.jawaban, kb.kategori, COUNT(*) as total
      FROM chat_messages cm
      JOIN knowledge_base kb ON kb.id = cm.matched_knowledge_id
      WHERE cm.is_answered = 1
    `;
    const rows = sinceIso
      ? db.prepare(`${base} AND cm.timestamp >= ? GROUP BY kb.id ORDER BY total DESC LIMIT ?`).all(sinceIso, limit)
      : db.prepare(`${base} GROUP BY kb.id ORDER BY total DESC LIMIT ?`).all(limit);
    return rows;
  },
  countAll() {
    return db.prepare('SELECT COUNT(*) as total FROM chat_messages').get().total;
  },
  countAnswered() {
    return db.prepare('SELECT COUNT(*) as total FROM chat_messages WHERE is_answered = 1').get().total;
  },
  countUnanswered() {
    return db.prepare('SELECT COUNT(*) as total FROM chat_messages WHERE is_answered = 0').get().total;
  },
};

module.exports = ChatMessageModel;
