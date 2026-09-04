/**
 * Seed data awal:
 *  - 1 akun panitia default (username: admin / password: admin123)
 *  - Beberapa entri basis pengetahuan dummy (syarat, biaya, jadwal, jalur masuk)
 *    sesuai mitigasi risiko "Basis pengetahuan kosong di awal" (PRD bagian 10)
 *
 * Jalankan: npm run seed
 */
const bcrypt = require('bcryptjs');
const db = require('./config/db');
const AdminModel = require('./models/admin.model');
const KnowledgeBaseModel = require('./models/knowledgeBase.model');

async function seed() {
  console.log('🌱 Seeding data awal...');

  if (AdminModel.count() === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    AdminModel.create({ nama: 'Panitia PPDB', username: 'admin', passwordHash });
    console.log('✅ Akun admin default dibuat (username: admin / password: admin123)');
  } else {
    console.log('ℹ️  Akun admin sudah ada, dilewati.');
  }

  const existingKb = db.prepare('SELECT COUNT(*) as total FROM knowledge_base').get().total;
  if (existingKb === 0) {
    const dummyData = [
      {
        kategori: 'syarat pendaftaran',
        pertanyaanUtama: 'Apa saja syarat pendaftaran PPDB di SMK Al-Bahri Bekasi?',
        variasiTambahan: [
          'syarat daftar sekolah apa aja',
          'dokumen yang dibutuhkan untuk daftar apa saja',
          'berkas apa yang harus disiapkan buat PPDB',
        ],
        jawaban:
          'Syarat pendaftaran PPDB SMK Al-Bahri Bekasi meliputi: fotokopi ijazah/SKL, fotokopi kartu keluarga, fotokopi akta kelahiran, pas foto 3x4 (3 lembar), dan mengisi formulir pendaftaran yang disediakan panitia.',
      },
      {
        kategori: 'biaya',
        pertanyaanUtama: 'Berapa biaya pendaftaran PPDB?',
        variasiTambahan: [
          'biaya masuk sekolah berapa',
          'daftar ppdb bayar berapa',
          'ada biaya pendaftaran gak',
        ],
        jawaban:
          'Biaya pendaftaran PPDB SMK Al-Bahri Bekasi adalah Rp150.000 untuk formulir dan tes seleksi. Informasi biaya SPP dan uang gedung dapat ditanyakan langsung ke bagian tata usaha.',
      },
      {
        kategori: 'jadwal',
        pertanyaanUtama: 'Kapan jadwal pendaftaran PPDB dibuka?',
        variasiTambahan: [
          'ppdb buka kapan',
          'jadwal pendaftaran tahun ini kapan',
          'sampai kapan pendaftaran dibuka',
        ],
        jawaban:
          'Pendaftaran PPDB SMK Al-Bahri Bekasi dibuka mulai awal Mei hingga akhir Juni setiap tahunnya. Jadwal pasti dapat berubah, silakan pantau pengumuman resmi sekolah untuk info terbaru.',
      },
      {
        kategori: 'jalur masuk',
        pertanyaanUtama: 'Apa saja jalur masuk yang tersedia di PPDB ini?',
        variasiTambahan: [
          'jalur pendaftaran apa aja',
          'ada jalur prestasi gak',
          'jalur masuk sekolah ada berapa',
        ],
        jawaban:
          'SMK Al-Bahri Bekasi menyediakan beberapa jalur masuk: jalur reguler (tes seleksi), jalur prestasi akademik/non-akademik, dan jalur afirmasi bagi keluarga kurang mampu dengan melampirkan dokumen pendukung.',
      },
      {
        kategori: 'jurusan',
        pertanyaanUtama: 'Jurusan apa saja yang tersedia di SMK Al-Bahri Bekasi?',
        variasiTambahan: [
          'ada jurusan apa aja',
          'program keahlian yang tersedia apa saja',
          'jurusan TKJ ada gak',
        ],
        jawaban:
          'SMK Al-Bahri Bekasi memiliki beberapa program keahlian, di antaranya Teknik Komputer dan Jaringan (TKJ), Akuntansi dan Keuangan Lembaga (AKL), serta Otomatisasi dan Tata Kelola Perkantoran (OTKP). Kuota tiap jurusan terbatas.',
      },
    ];

    dummyData.forEach((item) => KnowledgeBaseModel.create(item));
    console.log(`✅ ${dummyData.length} entri basis pengetahuan dummy berhasil ditambahkan.`);
  } else {
    console.log('ℹ️  Basis pengetahuan sudah memiliki data, dilewati.');
  }

  console.log('🌱 Seeding selesai.');
}

seed()
  .catch((err) => {
    console.error('❌ Seeding gagal:', err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());