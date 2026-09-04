# Frontend — Chatbot PPDB SMK Al-Bahri Bekasi
Antarmuka web chatbot layanan informasi PPDB SMK Al-Bahri Bekasi: halaman publik berisi widget chat untuk calon siswa/orang tua, dan panel admin untuk panitia PPDB. Dibangun dengan React 18 + Vite + Tailwind CSS.

1. Teknologi
Komponen	Teknologi
Library UI	React 18
Build tool	Vite 5
Styling	Tailwind CSS 3 + PostCSS + Autoprefixer
Routing	React Router DOM 6
HTTP client	Axios (dengan interceptor JWT)
Grafik	Recharts
Ikon	lucide-react

2. Struktur Proyek
frontend/
├── .env.example                  # VITE_API_BASE_URL
├── .gitignore
├── index.html                    # Root HTML Vite
├── package.json                  # Script: dev | build | preview
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
│
└── src/
    ├── main.jsx                  # Entry point React + BrowserRouter
    ├── App.jsx                   # Shell aplikasi + AuthProvider
    ├── index.css                 # Direktif Tailwind & style global
    │
    ├── routes/
    │   └── index.jsx             # Peta rute: "/" (publik) & "/admin/*"
    │
    ├── pages/
    │   ├── Home.jsx              # Landing page PPDB + widget chat
    │   ├── Admin.jsx             # Layout & sub-routing area admin
    │   └── admin/
    │       ├── Login.jsx         # Form login panitia
    │       └── Dashboard.jsx     # Dashboard: statistik, knowledge, inbox, setting
    │
    ├── components/
    │   ├── ChatWidget.jsx        # Bubble chat: sapaan, input, riwayat pesan
    │   ├── HealthBadge.jsx       # Indikator status koneksi ke backend
    │   └── admin/
    │       ├── Sidebar.jsx           # Navigasi panel admin
    │       ├── ProtectedRoute.jsx    # Penjaga rute — wajib login
    │       ├── KnowledgeTable.jsx    # Tabel daftar pengetahuan
    │       ├── KnowledgeFormModal.jsx# Form tambah/ubah jawaban & varian
    │       ├── UnansweredInbox.jsx   # Inbox pertanyaan tak terjawab
    │       ├── AnalyticsPanel.jsx    # Grafik Recharts & ringkasan metrik
    │       └── BotProfileForm.jsx    # Pengaturan nama bot, sapaan, threshold
    │
    ├── context/
    │   └── AuthContext.jsx       # State autentikasi panitia (token & profil)
    │
    ├── hooks/
    │   ├── useAuth.js            # Akses context auth (login/logout/user)
    │   ├── useChat.js            # Kelola sesi chat, kirim pesan, riwayat
    │   └── useHealthCheck.js     # Polling endpoint /api/health
    │
    └── utils/
        ├── api.js                # Instance Axios + interceptor token & 401
        └── similarity.js         # Helper kemiripan untuk tampilan sisi klien
   
3. Cara Menjalankan
cd frontend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173

4. Variabel Lingkungan (.env)
Variabel	Default	Keterangan
VITE_API_BASE_URL	http://localhost:4000/api	Base URL REST API backend

5. Rute Halaman
Rute	Akses	Isi
/	Publik	Informasi PPDB + widget chatbot 24/7
/admin/login	Publik	Form login panitia
/admin/*	Terproteksi	Dashboard statistik, kelola pengetahuan, inbox pertanyaan tak terjawab, pengaturan bot
Rute admin dibungkus ProtectedRoute.jsx; jika token tidak ada atau kedaluwarsa, pengguna otomatis diarahkan ke /admin/login.

Akun demo panitia: admin / admin123

6. Autentikasi & Komunikasi API
Token JWT hasil login disimpan di localStorage sebagai ppdb_admin_token, profil panitia sebagai ppdb_admin_profile.
utils/api.js menyisipkan header Authorization: Bearer <token> pada setiap request.
Jika API membalas 401, token & profil lokal dihapus dan pengguna dialihkan ke halaman login secara otomatis.
Endpoint chat (/chat/*) dan profil bot publik (/bot-profile) dipanggil tanpa token.

7. Alur Pemakaian Singkat
Pengunjung membuka /, widget chat memuat nama bot & pesan sapaan dari /bot-profile.
useChat.js membuat sesi (POST /chat/session) lalu mengirim pertanyaan (POST /chat/message).
Jawaban ditampilkan bila skor kemiripan melewati ambang; jika tidak, pesan fallback muncul dan pertanyaan otomatis masuk ke inbox panitia.
Panitia login di /admin/login, memantau statistik, menambah/memperbaiki jawaban, lalu mengubah pertanyaan tak terjawab menjadi pengetahuan baru.
