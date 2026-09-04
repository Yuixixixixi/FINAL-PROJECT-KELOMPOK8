const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/admin.model');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { ok, created, fail, unauthorized } = require('../utils/response');

// FR-1.1: form login panitia/admin
async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return fail(res, 'Username dan password wajib diisi', 422);

  const admin = AdminModel.findByUsername(username);
  if (!admin) return unauthorized(res, 'Username atau password salah');

  const validPassword = await bcrypt.compare(password, admin.password_hash);
  if (!validPassword) return unauthorized(res, 'Username atau password salah');

  const token = jwt.sign(
    { id: admin.id, username: admin.username, nama: admin.nama },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  return ok(res, {
    token,
    admin: { id: admin.id, nama: admin.nama, username: admin.username },
  }, 'Login berhasil');
}

// Registrasi admin baru — dibiarkan terbuka untuk setup awal/demo project.
// Untuk produksi sebaiknya dilindungi (mis. hanya superadmin, atau dimatikan setelah setup awal).
async function register(req, res) {
  const { nama, username, password } = req.body;
  if (!nama || !username || !password) {
    return fail(res, 'Nama, username, dan password wajib diisi', 422);
  }
  if (password.length < 6) {
    return fail(res, 'Password minimal 6 karakter', 422);
  }

  const existing = AdminModel.findByUsername(username);
  if (existing) return fail(res, 'Username sudah digunakan', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = AdminModel.create({ nama, username, passwordHash });

  return created(res, admin, 'Akun panitia berhasil dibuat');
}

function me(req, res) {
  const admin = AdminModel.findById(req.admin.id);
  return ok(res, admin, 'Profil admin');
}

module.exports = { login, register, me };
