# Chatbot Layanan Informasi PPDB SMK Al-Bahri Bekasi

[![Kelompok 8 - PAW Final Project](https://img.shields.io/badge/Kelompok-8-2563eb)](https://github.com/Yuixixixixi/FINAL-PROJECT-KELOMPOK8)
[![Backend: Express + SQLite](https://img.shields.io/badge/Backend-Express%20%2B%20SQLite-10b981)](https://expressjs.com)
[![Frontend: React + Vite](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-38bdf8)](https://vitejs.dev)

## 📖 Penjelasan Singkat

**Chatbot Layanan Informasi PPDB SMK Al-Bahri Bekasi** adalah aplikasi web full-stack
yang mengotomatiskan pelayanan informasi Penerimaan Peserta Didik Baru (PPDB) lewat
**chatbot 24/7**. Setiap masa PPDB, panitia kebanjiran pertanyaan berulang dari calon
siswa dan orang tua/wali (syarat pendaftaran, jadwal, biaya, jalur masuk) yang dijawab
manual satu per satu. Aplikasi ini menggantikan proses tersebut dengan chatbot yang
bisa menjawab kapan saja, bahkan di luar jam kerja.

Keunggulan utama: pencocokan pertanyaan memakai **Sentence Similarity Measurement
(TF-IDF + Cosine Similarity)** yang ditulis **native di JavaScript** — tanpa LLM
eksternal berbayar dan tanpa microservice Python. Bot tetap memahami pertanyaan yang
redaksinya berbeda-beda atau mengandung typo, lalu menjawab dari **basis pengetahuan
(basis data Q&A)** yang dikelola panitia langsung dari dashboard.

Fitur lengkapnya: chatbot publik real-time tanpa reload, autentikasi panitia (JWT),
CRUD basis pengetahuan + varian pertanyaan, **Unanswered Query Inbox** (pertanyaan
yang belum terjawab otomatis tercatat dan bisa diubah jadi Q&A baru), dashboard
analitik (pertanyaan populer, tren sesi), serta kustomisasi profil bot dan
threshold akurasi — semuanya dari UI tanpa perlu ubah kode.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 💬 Chatbot publik 24/7 | Widget chat tanpa login, respons real-time tanpa reload halaman |
| 🎯 Sentence Similarity Matching | TF-IDF + Cosine Similarity native JS, toleran terhadap typo & redaksi berbeda |
| 📚 Manajemen Basis Pengetahuan | CRUD Q&A, kategori, multi-varian pertanyaan per jawaban |
| 📥 Unanswered Query Inbox | Pertanyaan di bawah threshold tercatat otomatis & bisa dikonversi jadi Q&A |
| 📊 Dashboard Analitik | Pertanyaan populer, tren sesi harian, ringkasan terjawab/tak terjawab |
| 🤖 Profil Bot Kustom | Nama, sapaan, pesan fallback, avatar, dan threshold akurasi dari UI |
| 🔐 Autentikasi Panitia | Login JWT + password hash bcrypt |

---

## 🧰 Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Node.js + **Express 4** (CommonJS, struktur MVC: routes → controllers → models) |
| Database | **SQLite** via `better-sqlite3` (WAL mode, `foreign_keys = ON`) |
| Autentikasi | `jsonwebtoken` (JWT Bearer, masa berlaku 1 hari) + `bcryptjs` |
| Frontend | **React 18 + Vite 5**, `react-router-dom` v6, **Tailwind CSS 3**, `axios`, `lucide-react`, `recharts` |
| Algoritma NLP | **TF-IDF + Cosine Similarity** native JS (stopword Bahasa Indonesia, fuzzy Levenshtein, noise floor) |

---

## 📁 Struktur Proyek

```
fullstack-template/
├── backend/                     # API server (Express + SQLite)
│   ├── config/
│   │   ├── env.js               # Baca konfigurasi dari environment
│   │   └── db.js                # Koneksi & skema SQLite (auto-create saat start)
│   ├── controllers/             # Logika bisnis per modul
│   │   ├── admin.controller.js      # Login/register/me panitia
│   │   ├── chat.controller.js       # Sesi & pesan chat publik
│   │   ├── knowledge.controller.js  # CRUD basis pengetahuan + varian
│   │   ├── unanswered.controller.js # Inbox pertanyaan tak terjawab
│   │   ├── dashboard.controller.js  # Statistik analitik
│   │   ├── botProfile.controller.js # Profil & pesan bot
│   │   └── health.controller.js     # Health check
│   ├── middleware/
│   │   ├── auth.middleware.js   # Proteksi rute admin (JWT)
│   │   └── error.middleware.js  # Penanganan error terpusat
│   ├── models/                  # Akses data per tabel
│   │   ├── admin.model.js
│   │   ├── knowledgeBase.model.js
│   │   ├── chatSession.model.js
│   │   ├── chatMessage.model.js
│   │   ├── unansweredQuery.model.js
│   │   └── botProfile.model.js
│   ├── routes/                  # Definisi endpoint REST
│   │   ├── admin.routes.js
│   │   ├── chat.routes.js
│   │   ├── knowledge.routes.js
│   │   ├── unanswered.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── botProfile.routes.js
│   │   └── health.routes.js
│   ├── services/
│   │   └── similarity.service.js  # ⭐ TF-IDF + Cosine Similarity (native JS)
│   ├── utils/
│   │   └── response.js          # Format respons seragam
│   ├── db/                      # File database SQLite (ppdb.sqlite)
│   ├── .env.example             # Contoh konfigurasi environment
│   ├── app.js                   # Setup aplikasi Express
│   ├── server.js                # Entry point server
│   └── seed.js                  # Seed akun admin + Q&A dummy
│
└── frontend/                    # SPA React (Vite + Tailwind)
    ├── src/
    │   ├── components/
    │   │   ├── ChatWidget.jsx       # Widget chat publik
    │   │   ├── HealthBadge.jsx      # Badge status koneksi backend
    │   │   └── admin/               # Komponen dashboard panitia
    │   │       ├── Sidebar.jsx
    │   │       ├── ProtectedRoute.jsx
    │   │       ├── KnowledgeTable.jsx
    │   │       ├── KnowledgeFormModal.jsx
    │   │       ├── UnansweredInbox.jsx
    │   │       ├── AnalyticsPanel.jsx
    │   │       └── BotProfileForm.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx      # State login panitia
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   ├── useChat.js           # Logika chat real-time
    │   │   └── useHealthCheck.js
    │   ├── pages/
    │   │   ├── Home.jsx             # Halaman publik + widget chat
    │   │   ├── Admin.jsx
    │   │   └── admin/
    │   │       ├── Login.jsx
    │   │       └── Dashboard.jsx
    │   ├── routes/
    │   │   └── index.jsx            # Definisi rute react-router
    │   ├── utils/
    │   │   ├── api.js               # Axios instance (base URL API)
    │   │   └── similarity.js        # Util similarity (pendukung)
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example             # VITE_API_BASE_URL
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

---

## 🚀 Cara Menjalankan Proyek

### Prasyarat

- **Node.js** versi 18+ (disarankan LTS)
- **npm** (sudah termasuk saat install Node.js)

### Langkah 1 — Clone repositori

```bash
git clone https://github.com/ramdaniasyafitriani/fullstack-template.git
cd fullstack-template
```

### Langkah 2 — Jalankan Backend (port 4000)

```bash
cd backend
cp .env.example .env        # sesuaikan isi .env bila perlu
npm install
npm run seed                # buat akun admin + data Q&A dummy
npm run dev                 # jalankan dengan nodemon (http://localhost:4000)
```

> Akun panitia default hasil seed: **`admin` / `admin123`**
>
> Seed juga mengisi Q&A dummy (syarat pendaftaran, biaya, jadwal, jalur masuk)
> sehingga pencocokan similarity langsung bisa diuji/didemokan.

### Langkah 3 — Jalankan Frontend (port 5173)

Buka terminal baru:

```bash
cd frontend
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:4000/api
npm install
npm run dev                 # jalankan di http://localhost:5173
```

### Langkah 4 — Akses Aplikasi

| URL | Fungsi |
|---|---|
| `http://localhost:5173` | Chatbot publik (tanpa login) |
| `http://localhost:5173/admin/login` | Login dashboard panitia (`admin` / `admin123`) |
| `http://localhost:4000/api/health` | Cek status backend |

### Konfigurasi Environment

**Backend (`backend/.env`):**

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=1d
DB_PATH=./db/ppdb.sqlite
SIMILARITY_THRESHOLD=0.35
FRONTEND_ORIGIN=http://localhost:5173
```

**Frontend (`frontend/.env`):**

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## 👥 Pembagian Tugas Kelompok 8

| Anggota | NIM | Fokus | Area Kode |
|---|---|---|---|
| **Anugrah Putra R** | 20240140229 | Autentikasi & sesi chat | `admin.controller.js`, `auth.middleware.js`, `chat.controller.js`, `AuthContext.jsx`, `useChat.js`, `ChatWidget.jsx` |
| **Ramdania Syafitriani** | 20240140205 | Sentence Similarity Measurement | `services/similarity.service.js`, `utils/similarity.js`, pengujian threshold |
| **Bilkis Aqilatusshakila** | 20240140235 | Manajemen pengetahuan & Unanswered Inbox | `knowledge.controller.js`, `unanswered.controller.js`, `KnowledgeTable.jsx`, `KnowledgeFormModal.jsx`, `UnansweredInbox.jsx` |
| **T. Rayendra** | 20240140265 | Dashboard analitik & profil bot | `dashboard.controller.js`, `botProfile.controller.js`, `AnalyticsPanel.jsx`, `BotProfileForm.jsx` |

---

## 🔌 Ringkasan API

| Method & Path | Akses | Fungsi |
|---|---|---|
| `GET /api/health` | Publik | Status backend |
| `POST /api/chat/session` | Publik | Buat sesi chat baru |
| `POST /api/chat/message` | Publik | Kirim pertanyaan → similarity → jawaban/fallback |
| `GET /api/chat/session/:session_identifier/history` | Publik | Riwayat percakapan sesi |
| `GET /api/bot-profile` | Publik | Profil bot untuk widget |
| `POST /api/admin/login` · `POST /api/admin/register` · `GET /api/admin/me` | JWT | Autentikasi panitia |
| `GET/POST /api/admin/knowledge` · `GET /categories` · `GET/PUT/DELETE /:id` | JWT | CRUD basis pengetahuan |
| `POST /api/admin/knowledge/:id/variants` · `DELETE /:id/variants/:variantId` | JWT | Kelola varian pertanyaan |
| `GET /api/admin/unanswered` · `PATCH /:id/status` · `POST /:id/convert` | JWT | Unanswered Query Inbox |
| `GET /api/admin/dashboard/stats` | JWT | Statistik dashboard |
| `GET/PUT /api/bot-profile/admin` | JWT | Profil bot, pesan, threshold |

---

## 🧠 Cara Kerja Pencocokan Pertanyaan

1. Pengunjung mengirim pertanyaan, mis. *"syrat daftar jurusan TKJ apa aja?"*.
2. Backend menormalkan teks → tokenisasi → buang stopword Bahasa Indonesia.
3. Token dipetakan ke kosakata basis pengetahuan (persis, imbuhan, atau typo lewat
   Levenshtein ternormalisasi, ambang 0.78, minimal 4 karakter).
4. TF-IDF (smoothed IDF) dihitung untuk query dan setiap varian pertanyaan,
   lalu dibandingkan dengan **cosine similarity**.
5. Skor ≥ threshold (default **0.35**) → jawaban panitia ditampilkan dan pesan
   dicatat sebagai terjawab beserta skornya.
6. Skor < threshold → pesan fallback bot ditampilkan dan pertanyaan otomatis masuk
   **Unanswered Query Inbox** untuk ditindaklanjuti panitia.

Threshold bisa diubah kapan saja dari halaman **Profil Bot** di dashboard panitia,
tanpa perlu mengubah kode.

---

## 🗄️ Skema Database (SQLite)

| Tabel | Kolom |
|---|---|
| `admins` | id, nama, username (unik), password_hash, created_at |
| `knowledge_base` | id, kategori (default `umum`), jawaban, updated_at |
| `question_variants` | id, knowledge_id → `knowledge_base` (CASCADE), teks_pertanyaan |
| `chat_sessions` | id, session_identifier (unik), created_at |
| `chat_messages` | id, session_id → `chat_sessions` (CASCADE), pesan_user, matched_knowledge_id → `knowledge_base` (SET NULL), similarity_score, is_answered, timestamp |
| `unanswered_queries` | id, chat_message_id → `chat_messages` (CASCADE), pertanyaan, status (`baru`/`ditangani`/`diabaikan`), created_at |
| `bot_profile` | id (singleton = 1), nama_bot, pesan_sapaan, pesan_fallback, avatar, threshold (default 0.35) |

Skema dibuat otomatis oleh `backend/config/db.js` saat server pertama kali dijalankan.

---

## 📌 Catatan Teknis

- **Similarity berjalan native di backend Node.js** — tanpa microservice Python maupun
  LLM eksternal berbayar, sehingga mudah diuji dosen dan respons cepat.
- **SQLite file-based** — tidak perlu setup server database terpisah; cukup
  `npm install` di dua folder. File DB dibuat di `backend/db/ppdb.sqlite`.
- **Algoritma deterministik** — pertanyaan identik selalu menghasilkan skor dan
  jawaban yang sama.
- **Noise floor 0.08** — pertanyaan di luar topik (mis. "tes", "halo min") dipaksa
  skor 0 agar tidak salah match.
- Endpoint `POST /api/admin/register` sengaja terbuka untuk memudahkan setup/demo;
  sebaiknya dihapus atau dilindungi sebelum deploy produksi.

---

## 👥 Tim Pengembang

**Kelompok 8 — Final Project PAW (Pengembangan Aplikasi Web)**

- Anugrah Putra R (20240140229)
- Ramdania Syafitriani (20240140205)
- Bilkis Aqilatusshakila (20240140235)
- T. Rayendra (20240140265)

Repositori kelompok: [github.com/Yuixixixixi/FINAL-PROJECT-KELOMPOK8](https://github.com/Yuixixixixi/FINAL-PROJECT-KELOMPOK8)
