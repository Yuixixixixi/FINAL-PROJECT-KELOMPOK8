const UnansweredQueryModel = require('../models/unansweredQuery.model');
const KnowledgeBaseModel = require('../models/knowledgeBase.model');
const BotProfileModel = require('../models/botProfile.model');
const { findBestMatch } = require('../services/similarity.service');
const { ok, created, fail, notFound } = require('../utils/response');

// FR-4.2: panitia meninjau daftar pertanyaan tak terjawab
// Skor kemiripan dihitung ulang terhadap KB terkini (bukan skor beku saat pesan masuk),
// supaya typo seperti "jadawal pendaftaran" menampilkan skor sebenarnya.
function list(req, res) {
  const { status } = req.query; // baru | ditangani | diabaikan
  const items = UnansweredQueryModel.findAll({ status });
  const { threshold } = BotProfileModel.get();
  const variants = KnowledgeBaseModel.findAllVariantsForMatching();

  const withLiveScores = items.map((item) => {
    const { score } = findBestMatch(item.pertanyaan, variants);
    return { ...item, similarity_score: score };
  });

  return ok(res, { items: withLiveScores, threshold }, 'Daftar pertanyaan belum terjawab');
}

// ... fungsi updateStatus & convertToKnowledge biarkan sama


// FR-4.3: tandai status
function updateStatus(req, res) {
  const { status } = req.body;
  const allowed = ['baru', 'ditangani', 'diabaikan'];
  if (!allowed.includes(status)) {
    return fail(res, `Status harus salah satu dari: ${allowed.join(', ')}`, 422);
  }

  const existing = UnansweredQueryModel.findById(req.params.id);
  if (!existing) return notFound(res, 'Pertanyaan tidak ditemukan');

  const updated = UnansweredQueryModel.updateStatus(req.params.id, status);
  return ok(res, updated, 'Status berhasil diperbarui');
}

// FR-4.2: langsung jadikan entri baru di basis pengetahuan dari pertanyaan yang belum terjawab
function convertToKnowledge(req, res) {
  const existing = UnansweredQueryModel.findById(req.params.id);
  if (!existing) return notFound(res, 'Pertanyaan tidak ditemukan');

  const { jawaban, kategori, variasi_tambahan } = req.body;
  if (!jawaban || !jawaban.trim()) return fail(res, 'Jawaban wajib diisi', 422);

  const knowledgeItem = KnowledgeBaseModel.create({
    kategori: kategori && kategori.trim() ? kategori.trim() : 'umum',
    jawaban: jawaban.trim(),
    pertanyaanUtama: existing.pertanyaan,
    variasiTambahan: Array.isArray(variasi_tambahan) ? variasi_tambahan : [],
  });

  UnansweredQueryModel.updateStatus(req.params.id, 'ditangani');

  return created(res, knowledgeItem, 'Pertanyaan berhasil dijadikan entri basis pengetahuan baru');
}

module.exports = { list, updateStatus, convertToKnowledge };