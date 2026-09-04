const db = require('../config/db');

const AdminModel = {
  findByUsername(username) {
    return db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  },
  findById(id) {
    return db.prepare('SELECT id, nama, username, created_at FROM admins WHERE id = ?').get(id);
  },
  create({ nama, username, passwordHash }) {
    const stmt = db.prepare(
      'INSERT INTO admins (nama, username, password_hash) VALUES (?, ?, ?)'
    );
    const info = stmt.run(nama, username, passwordHash);
    return this.findById(info.lastInsertRowid);
  },
  count() {
    return db.prepare('SELECT COUNT(*) as total FROM admins').get().total;
  },
};

module.exports = AdminModel;
