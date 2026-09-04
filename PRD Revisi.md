Sistem informasi berbasis website yang dirancang untuk mengotomatiskan dan mempercepat pelayanan informasi Penerimaan Peserta Didik Baru (PPDB) di SMK Al-Bahri Bekasi. Aplikasi ini mentransformasikan proses pelayanan informasi konvensional yang lambat menjadi chatbot interaktif yang aktif 24/7, menggunakan algoritma Sentence Similarity Measurement (TF-IDF + Cosine Similarity) yang berjalan native di backend Node.js (Express) dengan database SQLite — tanpa LLM eksternal berbayar dan tanpa microservice Python — untuk pencocokan pertanyaan secara presisi, termasuk toleransi typo lewat fuzzy matching.

Buat Siapa:
Sistem ini dibuat untuk calon siswa dan orang tua/wali murid sebagai pengguna publik yang membutuhkan informasi cepat seputar PPDB tanpa perlu login (melalui widget chat di halaman utama), serta panitia PPDB / admin sekolah sebagai pengelola basis pengetahuan (knowledge base), penindaklanjut pertanyaan yang belum terjawab, dan pemantau statistik pertanyaan melalui dashboard yang dilindungi login JWT.

Fitur Utama:
Autentikasi Panitia (JWT + bcrypt) & Sesi Chat Real-Time — login admin terproteksi; chat publik tanpa login dan tanpa reload halaman, dengan session_identifier unik per pengunjung.
Pencocokan Pertanyaan Berbasis Sentence Similarity — pipeline normalisasi → stopword Bahasa Indonesia → fuzzy token matching (Levenshtein) → TF-IDF + Cosine Similarity, dengan noise floor dan threshold yang bisa diatur dari UI (default 0.35).
Manajemen Pengetahuan Bot (Question & Response Management) — CRUD Q&A dengan kategori dan multi-varian pertanyaan per jawaban.
Penanganan Pertanyaan Unik/Belum Terjawab (Unanswered Query Inbox) — pertanyaan di bawah threshold tercatat otomatis dan bisa dikonversi langsung menjadi entri Q&A baru.
Dasbor Analitik Statistik Pertanyaan Populer — top-10 pertanyaan, tren sesi harian, dan ringkasan terjawab/tak terjawab (grafik recharts).
Kustomisasi Profil & Pesan Respons Bot — nama bot, pesan sapaan, pesan fallback, avatar, dan threshold diatur dari halaman Profil Bot tanpa mengubah kode.

👥 Anggota Kelompok & Pembagian Kerja
Ramdania Syafitriani – 20240140205 — Sentence Similarity Measurement 
Anugrah Putra R – 20240140229 —  Autentikasi & sesi chat 
Bilkis Aqilatusshakila – 20240140235 — Manajemen pengetahuan & Unanswered Inbox 
T. Rayendra – 20240140265 — Dashboard analitik & profil bot 

🔗 Link Repository
https://github.com/Yuixixixixi/FINAL-PROJECT-KELOMPOK8.git

📁 Link Drive
https://drive.google.com/drive/folders/1KvSvjKmXBmadlkq2t_rMk7mTSwoSK8Y3
