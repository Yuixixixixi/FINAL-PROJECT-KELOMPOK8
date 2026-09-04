const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { dbPath } = require('./env');

const resolvedPath = path.isAbsolute(dbPath) ? dbPath : path.join(__dirname, '..', dbPath);
const dir = path.dirname(resolvedPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(resolvedPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---- Schema (skema data sesuai PRD bagian 8) ----
db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kategori TEXT NOT NULL DEFAULT 'umum',
  jawaban TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS question_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  knowledge_id INTEGER NOT NULL REFERENCES knowledge_base(id) ON DELETE CASCADE,
  teks_pertanyaan TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_identifier TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  pesan_user TEXT NOT NULL,
  matched_knowledge_id INTEGER REFERENCES knowledge_base(id) ON DELETE SET NULL,
  similarity_score REAL,
  is_answered INTEGER NOT NULL DEFAULT 0,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS unanswered_queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
  pertanyaan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'baru', -- baru | ditangani | diabaikan
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bot_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  nama_bot TEXT NOT NULL DEFAULT 'Al-Bahri Assistant',
  pesan_sapaan TEXT NOT NULL DEFAULT 'Halo! Ada yang bisa saya bantu seputar PPDB SMK Al-Bahri Bekasi?',
  pesan_fallback TEXT NOT NULL DEFAULT 'Maaf, saya belum menemukan jawaban yang sesuai. Pertanyaan Anda sudah kami catat dan akan segera dijawab oleh panitia.',
  avatar TEXT,
  threshold REAL NOT NULL DEFAULT 0.35
);

INSERT OR IGNORE INTO bot_profile (id) VALUES (1);
`);

module.exports = db;
