const BotProfileModel = require('../models/botProfile.model');
const { ok, fail } = require('../utils/response');

// Publik: dipakai widget chat untuk sapaan awal
function getPublicProfile(req, res) {
  const profile = BotProfileModel.get();
  return ok(res, {
    nama_bot: profile.nama_bot,
    pesan_sapaan: profile.pesan_sapaan,
    avatar: profile.avatar,
  }, 'Profil bot');
}

// Admin: lihat profil lengkap termasuk threshold & pesan fallback
function getAdminProfile(req, res) {
  return ok(res, BotProfileModel.get(), 'Profil bot (admin)');
}

// FR-6.1, FR-6.2, FR-6.3, FR-2.4: kustomisasi profil bot & threshold similarity
function updateProfile(req, res) {
  const { nama_bot, pesan_sapaan, pesan_fallback, avatar, threshold } = req.body;

  if (threshold !== undefined && (threshold < 0 || threshold > 1)) {
    return fail(res, 'Threshold harus di antara 0 dan 1', 422);
  }

  const updated = BotProfileModel.update({
    namaBot: nama_bot,
    pesanSapaan: pesan_sapaan,
    pesanFallback: pesan_fallback,
    avatar,
    threshold,
  });

  return ok(res, updated, 'Profil bot berhasil diperbarui');
}

module.exports = { getPublicProfile, getAdminProfile, updateProfile };
