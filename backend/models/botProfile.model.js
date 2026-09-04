const db = require('../config/db');

const BotProfileModel = {
  get() {
    return db.prepare('SELECT * FROM bot_profile WHERE id = 1').get();
  },
  update({ namaBot, pesanSapaan, pesanFallback, avatar, threshold }) {
    const current = this.get();
    db.prepare(
      `UPDATE bot_profile
       SET nama_bot = ?, pesan_sapaan = ?, pesan_fallback = ?, avatar = ?, threshold = ?
       WHERE id = 1`
    ).run(
      namaBot ?? current.nama_bot,
      pesanSapaan ?? current.pesan_sapaan,
      pesanFallback ?? current.pesan_fallback,
      avatar ?? current.avatar,
      threshold ?? current.threshold
    );
    return this.get();
  },
};

module.exports = BotProfileModel;
