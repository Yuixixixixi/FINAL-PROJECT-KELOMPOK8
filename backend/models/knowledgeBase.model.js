const db = require('../config/db');

const KnowledgeBaseModel = {
  // Ambil semua entri KB beserta variasi pertanyaannya (FR-3.3)
  findAll({ kategori } = {}) {
    const rows = kategori
      ? db.prepare('SELECT * FROM knowledge_base WHERE kategori = ? ORDER BY updated_at DESC').all(kategori)
      : db.prepare('SELECT * FROM knowledge_base ORDER BY updated_at DESC').all();

    const variantStmt = db.prepare('SELECT id, teks_pertanyaan FROM question_variants WHERE knowledge_id = ?');
    return rows.map((row) => ({
      ...row,
      variants: variantStmt.all(row.id),
    }));
  },

  // Semua variasi pertanyaan gabung dengan knowledge_id -> dipakai mesin similarity
  findAllVariantsForMatching() {
    return db
      .prepare(
        `SELECT qv.id as variant_id, qv.teks_pertanyaan, kb.id as knowledge_id, kb.jawaban, kb.kategori
         FROM question_variants qv
         JOIN knowledge_base kb ON kb.id = qv.knowledge_id`
      )
      .all();
  },

  findById(id) {
    const row = db.prepare('SELECT * FROM knowledge_base WHERE id = ?').get(id);
    if (!row) return null;
    row.variants = db.prepare('SELECT id, teks_pertanyaan FROM question_variants WHERE knowledge_id = ?').all(id);
    return row;
  },

  // pertanyaanUtama + variasiTambahan (array string)
  create({ kategori, jawaban, pertanyaanUtama, variasiTambahan = [] }) {
    const insertKb = db.prepare('INSERT INTO knowledge_base (kategori, jawaban) VALUES (?, ?)');
    const insertVariant = db.prepare('INSERT INTO question_variants (knowledge_id, teks_pertanyaan) VALUES (?, ?)');

    const tx = db.transaction(() => {
      const info = insertKb.run(kategori || 'umum', jawaban);
      const knowledgeId = info.lastInsertRowid;
      insertVariant.run(knowledgeId, pertanyaanUtama);
      variasiTambahan
        .filter((v) => v && v.trim())
        .forEach((v) => insertVariant.run(knowledgeId, v.trim()));
      return knowledgeId;
    });

    const knowledgeId = tx();
    return this.findById(knowledgeId);
  },

  update(id, { kategori, jawaban }) {
    db.prepare(
      "UPDATE knowledge_base SET kategori = ?, jawaban = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(kategori, jawaban, id);
    return this.findById(id);
  },

  delete(id) {
    return db.prepare('DELETE FROM knowledge_base WHERE id = ?').run(id);
  },

  addVariant(knowledgeId, teksPertanyaan) {
    const info = db
      .prepare('INSERT INTO question_variants (knowledge_id, teks_pertanyaan) VALUES (?, ?)')
      .run(knowledgeId, teksPertanyaan);
    db.prepare("UPDATE knowledge_base SET updated_at = datetime('now') WHERE id = ?").run(knowledgeId);
    return { id: info.lastInsertRowid, knowledge_id: knowledgeId, teks_pertanyaan: teksPertanyaan };
  },

  deleteVariant(variantId) {
    return db.prepare('DELETE FROM question_variants WHERE id = ?').run(variantId);
  },

  categories() {
    return db
      .prepare('SELECT DISTINCT kategori FROM knowledge_base ORDER BY kategori')
      .all()
      .map((r) => r.kategori);
  },
};

module.exports = KnowledgeBaseModel;
