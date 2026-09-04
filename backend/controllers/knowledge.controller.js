const KnowledgeBaseModel = require('../models/knowledgeBase.model');
const { ok, created, fail, notFound } = require('../utils/response');

// FR-3.2: filter berdasarkan kategori (opsional query ?kategori=)
function list(req, res) {
  const { kategori } = req.query;
  const items = KnowledgeBaseModel.findAll({ kategori });
  return ok(res, items, 'Daftar basis pengetahuan');
}

function categories(req, res) {
  return ok(res, KnowledgeBaseModel.categories(), 'Daftar kategori');
}

function detail(req, res) {
  const item = KnowledgeBaseModel.findById(req.params.id);
  if (!item) return notFound(res, 'Entri pengetahuan tidak ditemukan');
  return ok(res, item, 'Detail entri pengetahuan');
}

// FR-3.1 & FR-3.3: buat entri baru + pertanyaan utama + variasi pertanyaan tambahan
function create(req, res) {
  const { kategori, jawaban, pertanyaan_utama, variasi_tambahan } = req.body;

  if (!jawaban || !jawaban.trim()) return fail(res, 'Jawaban wajib diisi', 422);
  if (!pertanyaan_utama || !pertanyaan_utama.trim()) {
    return fail(res, 'Pertanyaan utama wajib diisi', 422);
  }

  const item = KnowledgeBaseModel.create({
    kategori: kategori && kategori.trim() ? kategori.trim() : 'umum',
    jawaban: jawaban.trim(),
    pertanyaanUtama: pertanyaan_utama.trim(),
    variasiTambahan: Array.isArray(variasi_tambahan) ? variasi_tambahan : [],
  });

  return created(res, item, 'Entri pengetahuan berhasil ditambahkan');
}

// FR-3.1: ubah kategori/jawaban
function update(req, res) {
  const existing = KnowledgeBaseModel.findById(req.params.id);
  if (!existing) return notFound(res, 'Entri pengetahuan tidak ditemukan');

  const { kategori, jawaban } = req.body;
  if (!jawaban || !jawaban.trim()) return fail(res, 'Jawaban wajib diisi', 422);

  const updated = KnowledgeBaseModel.update(req.params.id, {
    kategori: kategori && kategori.trim() ? kategori.trim() : existing.kategori,
    jawaban: jawaban.trim(),
  });

  return ok(res, updated, 'Entri pengetahuan berhasil diperbarui');
}

// FR-3.1: hapus entri
function remove(req, res) {
  const existing = KnowledgeBaseModel.findById(req.params.id);
  if (!existing) return notFound(res, 'Entri pengetahuan tidak ditemukan');

  KnowledgeBaseModel.delete(req.params.id);
  return ok(res, null, 'Entri pengetahuan berhasil dihapus');
}

// FR-3.3: tambah variasi pertanyaan baru ke entri yang sudah ada
function addVariant(req, res) {
  const existing = KnowledgeBaseModel.findById(req.params.id);
  if (!existing) return notFound(res, 'Entri pengetahuan tidak ditemukan');

  const { teks_pertanyaan } = req.body;
  if (!teks_pertanyaan || !teks_pertanyaan.trim()) {
    return fail(res, 'Teks pertanyaan wajib diisi', 422);
  }

  const variant = KnowledgeBaseModel.addVariant(req.params.id, teks_pertanyaan.trim());
  return created(res, variant, 'Variasi pertanyaan berhasil ditambahkan');
}

function removeVariant(req, res) {
  KnowledgeBaseModel.deleteVariant(req.params.variantId);
  return ok(res, null, 'Variasi pertanyaan berhasil dihapus');
}

module.exports = { list, categories, detail, create, update, remove, addVariant, removeVariant };
