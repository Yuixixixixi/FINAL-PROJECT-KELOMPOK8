# Backend — Chatbot PPDB SMK Al-Bahri Bekasi
REST API untuk chatbot layanan informasi PPDB SMK Al-Bahri Bekasi. Dibangun dengan Express + SQLite (better-sqlite3) + JWT, dengan mesin pencocokan pertanyaan TF-IDF + Cosine Similarity yang ditulis native JavaScript (tanpa library ML).

1. Teknologi
Komponen	Teknologi
Runtime	Node.js 18+ (CommonJS)
Framework	Express 4
Database	SQLite via better-sqlite3 (mode WAL)
Autentikasi	JSON Web Token (jsonwebtoken) + bcryptjs
Logging	morgan
Konfigurasi	dotenv
Dev tool	nodemon

2. Struktur Proyek
backend/
├── .env.example                  # Contoh variabel lingkungan
├── .gitignore
├── package.json                  # Script: start | dev | seed
├── server.js                     # Entry point — menjalankan app pada PORT
├── app.js                        # Inisialisasi Express, CORS, middleware, routing
├── seed.js                       # Isi data awal: admin, bot profile, knowledge base
│
├── config/
│   ├── env.js                    # Pembacaan & default variabel .env
│   └── db.js                     # Koneksi SQLite + definisi seluruh skema tabel
│
├── routes/                       # Definisi endpoint per domain
│   ├── health.routes.js          # /api/health
│   ├── chat.routes.js            # /api/chat (publik)
│   ├── admin.routes.js           # /api/admin (login/register/me)
│   ├── knowledge.routes.js       # /api/admin/knowledge (terproteksi)
│   ├── unanswered.routes.js      # /api/admin/unanswered (terproteksi)
│   ├── dashboard.routes.js       # /api/admin/dashboard (terproteksi)
│   └── botProfile.routes.js      # /api/bot-profile
│
├── controllers/                  # Logika request/response tiap endpoint
│   ├── health.controller.js
│   ├── chat.controller.js        # Mulai sesi, kirim pesan, riwayat chat
│   ├── admin.controller.js       # Login, register, profil panitia
│   ├── knowledge.controller.js   # CRUD pengetahuan + varian pertanyaan
│   ├── unanswered.controller.js  # Inbox pertanyaan tak terjawab
│   ├── dashboard.controller.js   # Statistik & analitik
│   └── botProfile.controller.js  # Pengaturan identitas & threshold bot
│
├── models/                       # Query SQL per tabel (data access layer)
│   ├── admin.model.js
│   ├── knowledgeBase.model.js
│   ├── chatSession.model.js
│   ├── chatMessage.model.js
│   ├── unansweredQuery.model.js
│   └── botProfile.model.js
│
├── services/
│   └── similarity.service.js     # Preprocessing teks + TF-IDF + Cosine Similarity
│
├── middleware/
│   ├── auth.middleware.js        # requireAuth — verifikasi Bearer JWT
│   └── error.middleware.js       # notFoundHandler & errorHandler global
│
└── utils/
    └── response.js               # Format respons JSON konsisten

3. Cara Menjalankan
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run seed              # membuat database + data awal
npm run dev               # http://localhost:4000

Perintah lain:
npm start — menjalankan server tanpa nodemon (produksi).
npm run seed — mengisi ulang admin default, profil bot, dan knowledge base awal.
Akun demo panitia: admin / admin123

4. Variabel Lingkungan (.env)
Variabel	Default	Keterangan
PORT	4000	Port server API
NODE_ENV	development	Mode aplikasi
JWT_SECRET	—	Kunci rahasia penandatanganan token (wajib diganti)
JWT_EXPIRES_IN	1d	Masa berlaku token
DB_PATH	./db/ppdb.sqlite	Lokasi file SQLite (relatif terhadap backend/)
SIMILARITY_THRESHOLD	0.35	Ambang minimal skor kemiripan agar jawaban dianggap cocok
FRONTEND_ORIGIN	http://localhost:5173	Origin yang diizinkan CORS

5. Daftar Endpoint
Base URL: http://localhost:4000/api

Publik
Method	Endpoint	Fungsi
GET	/health	Cek status server & database
POST	/chat/session	Membuat sesi chat baru (mengembalikan session_identifier)
POST	/chat/message	Mengirim pertanyaan, menerima jawaban + skor kemiripan
GET	/chat/session/:session_identifier/history	Riwayat percakapan satu sesi
GET	/bot-profile	Nama bot, sapaan, avatar untuk widget chat
POST	/admin/login	Login panitia, mengembalikan JWT
POST	/admin/register	Registrasi akun panitia
Terproteksi (header Authorization: Bearer <token>)
Method	Endpoint	Fungsi
GET	/admin/me	Profil panitia yang sedang login
GET	/admin/knowledge	Daftar pengetahuan (dengan pencarian/filter)
GET	/admin/knowledge/categories	Daftar kategori
GET	/admin/knowledge/:id	Detail satu pengetahuan
POST	/admin/knowledge	Tambah pengetahuan baru
PUT	/admin/knowledge/:id	Ubah pengetahuan
DELETE	/admin/knowledge/:id	Hapus pengetahuan
POST	/admin/knowledge/:id/variants	Tambah varian pertanyaan
DELETE	/admin/knowledge/:id/variants/:variantId	Hapus varian pertanyaan
GET	/admin/unanswered	Inbox pertanyaan tak terjawab
PATCH	/admin/unanswered/:id/status	Ubah status (baru/ditangani/diabaikan)
POST	/admin/unanswered/:id/convert	Jadikan pertanyaan sebagai pengetahuan baru
GET	/admin/dashboard/stats	Statistik chat, tingkat keberhasilan, tren
GET	/bot-profile/admin	Pengaturan bot (versi admin)
PUT	/bot-profile/admin	Ubah nama, sapaan, fallback, avatar, threshold

6. Skema Database
Tabel	Isi
admins	Akun panitia PPDB (username unik, password_hash bcrypt)
knowledge_base	Jawaban resmi beserta kategori
question_variants	Beberapa varian pertanyaan untuk satu jawaban
chat_sessions	Sesi percakapan pengunjung (session_identifier unik)
chat_messages	Pesan user, id jawaban yang cocok, skor kemiripan, status terjawab
unanswered_queries	Pertanyaan di bawah threshold, siap ditindaklanjuti panitia
bot_profile	Baris tunggal: nama bot, sapaan, pesan fallback, avatar, threshold
Relasi memakai FOREIGN KEY dengan ON DELETE CASCADE / SET NULL, dan foreign_keys = ON diaktifkan di config/db.js.

7. Alur Pencocokan Pertanyaan
Pesan user diterima POST /api/chat/message.
similarity.service.js melakukan preprocessing: lowercase, hapus tanda baca, tokenisasi, buang stopword.
Seluruh varian pertanyaan pada question_variants diubah menjadi vektor TF-IDF.
Skor Cosine Similarity dihitung antara pertanyaan user dan setiap varian.
Skor tertinggi diambil:
≥ threshold → jawaban dari knowledge_base dikirim, is_answered = 1.
< threshold → pesan fallback dikirim dan pertanyaan dicatat ke unanswered_queries.
Setiap pesan beserta skornya disimpan di chat_messages untuk analitik dashboard.
