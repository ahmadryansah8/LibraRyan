import { CollectionFormat, CollectionItem, DDCCategory, DDCCode, LibraryState, Member, Transaction } from '../types/library';

export const DDC_CATEGORIES: DDCCategory[] = [
  { code: '000', label: '000 — Karya Umum & Ilmu Komputer', shortLabel: '000 Karya Umum' },
  { code: '100', label: '100 — Filsafat & Psikologi', shortLabel: '100 Filsafat' },
  { code: '200', label: '200 — Agama', shortLabel: '200 Agama' },
  { code: '300', label: '300 — Ilmu Sosial', shortLabel: '300 Ilmu Sosial' },
  { code: '400', label: '400 — Bahasa', shortLabel: '400 Bahasa' },
  { code: '500', label: '500 — Sains & Matematika', shortLabel: '500 Sains' },
  { code: '600', label: '600 — Teknologi & Ilmu Terapan', shortLabel: '600 Teknologi' },
  { code: '700', label: '700 — Seni & Rekreasi', shortLabel: '700 Seni' },
  { code: '800', label: '800 — Sastra', shortLabel: '800 Sastra' },
  { code: '900', label: '900 — Sejarah & Geografi', shortLabel: '900 Sejarah' },
];

export const COLLECTION_FORMATS: CollectionFormat[] = [
  'E-Book',
  'Buku Referensi',
  'Jurnal',
  'Cerita Rakyat',
  'Audiobook',
];

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRelativeDateISO(offsetDays: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return formatDateISO(d);
}

export function getDDCColor(code: DDCCode): string {
  const palette: Record<DDCCode, string> = {
    '000': '#2563EB',
    '100': '#4F46E5',
    '200': '#0D9488',
    '300': '#0284C7',
    '400': '#D97706',
    '500': '#16A34A',
    '600': '#0F172A',
    '700': '#DB2777',
    '800': '#9333EA',
    '900': '#B45309',
  };
  return palette[code];
}

export function createInitialSeedState(): LibraryState {
  const collections: CollectionItem[] = [
    {
      id: 'col-001',
      title: 'Algoritma dan Pemrograman Modern dengan Python',
      author: 'Dr. Rinaldi Munir & Hendra Wijaya',
      publisher: 'Informatika Bandung',
      year: 2024,
      isbnIssn: '978-623-7131-84-2',
      ddcNumber: '005.133',
      ddcCategory: '000',
      callNumber: '005.133 MUN a',
      format: 'E-Book',
      subject: 'Pemrograman Python, Struktur Data, Algoritma',
      totalCopies: 5,
      availableCopies: 4,
      synopsis:
        'Panduan komprehensif merancang algoritma efisien, analisis kompleksitas waktu dan ruang, serta implementasi struktur data modern menggunakan Python 3.12 untuk mahasiswa dan praktisi rekayasa perangkat lunak.',
      shelfLocation: 'Repositori Digital · Server A-01',
      durationOrPages: '412 halaman · PDF & EPUB',
      sampleExcerpt:
        'Bab 1: Pemikiran Komputasional dan Kompleksitas Asimtotik. Setiap perangkat lunak berskala besar bertumpu pada pemilihan struktur data yang selaras dengan pola akses memori dan kebutuhan latensi sistem...',
      createdAt: getRelativeDateISO(-60),
    },
    {
      id: 'col-002',
      title: 'Filosofi Teras: Filsafat Yunani-Romawi Kuno untuk Mental Tangguh',
      author: 'Henry Manampiring',
      publisher: 'Penerbit Buku Kompas',
      year: 2023,
      isbnIssn: '978-602-4125-18-9',
      ddcNumber: '158.1',
      ddcCategory: '100',
      callNumber: '158.1 MAN f',
      format: 'Audiobook',
      subject: 'Stoikisme, Psikologi Terapan, Pengembangan Diri',
      totalCopies: 3,
      availableCopies: 2,
      synopsis:
        'Pengenalan ajaran Stoikisme yang membumi dan relevan dengan tantangan kecemasan generasi modern di era digital, dilengkapi narasi audio berkualitas studio dengan pembahasan dikotomi kendali.',
      shelfLocation: 'Koleksi Audio Digital · Kanal B-04',
      durationOrPages: '6 jam 45 menit · Audio HD',
      sampleExcerpt:
        'Prolog Audio — Dikotomi Kendali: Ada hal-hal di dunia ini yang berada di bawah kendali penuh kita, seperti pikiran dan sikap kita sendiri, dan ada hal-hal di luar kendali kita yang tidak semestinya merampas ketenangan batin...',
      createdAt: getRelativeDateISO(-55),
    },
    {
      id: 'col-003',
      title: 'Tafsir Al-Mishbah: Pesan, Kesan, dan Keserasian Al-Qur\'an Jilid 1',
      author: 'Prof. Dr. M. Quraish Shihab',
      publisher: 'Lentera Hati',
      year: 2022,
      isbnIssn: '978-979-9023-41-5',
      ddcNumber: '297.122',
      ddcCategory: '200',
      callNumber: '297.122 SHI t',
      format: 'Buku Referensi',
      subject: 'Tafsir Al-Qur\'an, Studi Islam, Referensi Keagamaan',
      totalCopies: 4,
      availableCopies: 4,
      synopsis:
        'Karya tafsir monumental ulama Indonesia yang mengupas keterkaitan antarayat dan antarsurat dengan pendekatan bahasa, sejarah turunnya ayat, serta relevansi sosial masyarakat Nusantara.',
      shelfLocation: 'Lantai 2 · Rak Referensi R-201',
      durationOrPages: '684 halaman · Jilid Keras',
      sampleExcerpt:
        'Pengantar Metodologi Tafsir Tematik: Memahami keserasian susunan ayat merupakan kunci menangkap pesan utuh sebuah surat sebelum menafsirkan bagian-bagian rincinya dalam konteks kemasyarakatan...',
      createdAt: getRelativeDateISO(-50),
    },
    {
      id: 'col-004',
      title: 'Jurnal Sosiologi Masyarakat Maritim Nusantara Vol. 18',
      author: 'Dewan Redaksi Pusat Studi Maritim LIPI',
      publisher: 'BRIN Press',
      year: 2025,
      isbnIssn: '2549-8812',
      ddcNumber: '306.095',
      ddcCategory: '300',
      callNumber: '306.095 BRI j',
      format: 'Jurnal',
      subject: 'Sosiologi Maritim, Ekonomi Pesisir, Masyarakat Kepulauan',
      totalCopies: 4,
      availableCopies: 3,
      synopsis:
        'Kumpulan artikel riset empiris mengenai dinamika sosial-ekonomi nelayan tradisional, ketahanan pangan pesisir, dan tata kelola laut berkelanjutan di kawasan Indonesia Timur.',
      shelfLocation: 'Repositori Berkala · Terbitan 2025',
      durationOrPages: '164 halaman · 9 Artikel Terindeks',
      sampleExcerpt:
        'Abstrak Artikel Utama: Transformasi kelembagaan koperasi nelayan di Sulawesi Tenggara menunjukkan peningkatan daya tawar harga tangkapan sebesar 28% melalui pencatatan rantai dingin berbasis digital...',
      createdAt: getRelativeDateISO(-45),
    },
    {
      id: 'col-005',
      title: 'Tata Bahasa Baku Bahasa Indonesia Edisi Kelima',
      author: 'Hans Lapoliwa, Hasan Alwi & Tim Badan Bahasa',
      publisher: 'Balai Pustaka',
      year: 2023,
      isbnIssn: '978-602-2601-92-0',
      ddcNumber: '499.221',
      ddcCategory: '400',
      callNumber: '499.221 LAP t',
      format: 'Buku Referensi',
      subject: 'Linguistik Indonesia, Sintaksis, Ejaan Resmi',
      totalCopies: 6,
      availableCopies: 6,
      synopsis:
        'Rujukan standar nasional mengenai fonologi, morfologi, sintaksis, dan semantik bahasa Indonesia modern yang diperbarui selaras dengan EYD Edisi V.',
      shelfLocation: 'Lantai 1 · Rak Referensi Bahasa R-402',
      durationOrPages: '548 halaman · Edisi Referensi',
      sampleExcerpt:
        'Bab III — Struktur Frasa dan Klausa Baku: Penataan unsur inti dan pewatas dalam kalimat efektif ilmiah menuntut ketepatan fungsi subjek, predikat, serta konsistensi imbuhan verba transitif...',
      createdAt: getRelativeDateISO(-42),
    },
    {
      id: 'col-006',
      title: 'Pengantar Fisika Kuantum dan Komputasi Masa Depan',
      author: 'Dr.rer.nat. Terry Mart',
      publisher: 'UI Publishing',
      year: 2024,
      isbnIssn: '978-623-3334-19-8',
      ddcNumber: '530.12',
      ddcCategory: '500',
      callNumber: '530.12 MAR p',
      format: 'E-Book',
      subject: 'Fisika Kuantum, Mekanika Gelombang, Komputasi Kuantum',
      totalCopies: 4,
      availableCopies: 4,
      synopsis:
        'Penjelasan sistematis mengenai dualisme gelombang-partikel, persamaan Schrödinger, belitan kuantum, hingga penerapan gerbang logika qubit dalam komputasi modern.',
      shelfLocation: 'Repositori Digital · Server S-05',
      durationOrPages: '356 halaman · PDF Interaktif',
      sampleExcerpt:
        'Bab 2: Superposisi dan Ruang Hilbert. Tidak seperti bit klasik yang hanya bernilai 0 atau 1 secara eksklusif, keadaan kuantum sebuah qubit direpresentasikan sebagai kombinasi linear vektor basis...',
      createdAt: getRelativeDateISO(-38),
    },
    {
      id: 'col-007',
      title: 'Jurnal Inovasi Agritech dan Pertanian Presisi Tropis',
      author: 'Fakultas Teknologi Pertanian IPB',
      publisher: 'IPB Press',
      year: 2025,
      isbnIssn: '2715-4420',
      ddcNumber: '630.959',
      ddcCategory: '600',
      callNumber: '630.959 IPB j',
      format: 'Jurnal',
      subject: 'Pertanian Presisi, Sensor IoT Agrikultur, Ketahanan Pangan',
      totalCopies: 3,
      availableCopies: 3,
      synopsis:
        'Publikasi ilmiah berkala yang mengulas pemanfaatan drone pemetaan lahan, sensor kelembapan tanah berbasis IoT, dan irigasi otomatis untuk komoditas pangan tropis di Indonesia.',
      shelfLocation: 'Repositori Berkala · Agroteknologi',
      durationOrPages: '128 halaman · 7 Artikel Riset',
      sampleExcerpt:
        'Ringkasan Riset: Penggunaan indeks vegetasi multispektral pada lahan sawah tadah hujan mampu mendeteksi defisiensi nitrogen 14 hari lebih awal dibanding pengamatan visual konvensional...',
      createdAt: getRelativeDateISO(-32),
    },
    {
      id: 'col-008',
      title: 'Sejarah Seni Rupa Modern dan Arsitektur Nusantara',
      author: 'Prof. Agus Sachari & Jim Supangkat',
      publisher: 'ITB Press',
      year: 2021,
      isbnIssn: '978-602-5428-73-9',
      ddcNumber: '709.598',
      ddcCategory: '700',
      callNumber: '709.598 SAC s',
      format: 'Buku Referensi',
      subject: 'Seni Rupa Indonesia, Arsitektur Tropis, Desain Modern',
      totalCopies: 2,
      availableCopies: 2,
      synopsis:
        'Dokumentasi visual dan kajian kritis perjalanan seni rupa Indonesia dari masa Mooi Indie, Persagi, gerakan seni rupa baru, hingga perkembangan arsitektur vernakular kontemporer.',
      shelfLocation: 'Lantai 2 · Rak Seni & Desain R-701',
      durationOrPages: '390 halaman · Ilustrasi Berwarna',
      sampleExcerpt:
        'Bab 4 — Sintesis Tropis dalam Arsitektur Awal Kemerdekaan: Para arsitek generasi pertama Indonesia merespons iklim lembap khatulistiwa dengan mengolah kisi-kisi ventilasi silang dan teritisan lebar...',
      createdAt: getRelativeDateISO(-27),
    },
    {
      id: 'col-009',
      title: 'Hikayat Malin Kundang & Kumpulan Legenda Pesisir Sumatera',
      author: 'A.A. Navis & Tim Dokumentasi Sastra Lisan',
      publisher: 'Yayasan Pustaka Obor Indonesia',
      year: 2022,
      isbnIssn: '978-623-3211-08-6',
      ddcNumber: '899.221',
      ddcCategory: '800',
      callNumber: '899.221 NAV h',
      format: 'Cerita Rakyat',
      subject: 'Sastra Lisan, Cerita Rakyat Minangkabau, Legenda Nusantara',
      totalCopies: 5,
      availableCopies: 5,
      synopsis:
        'Antologi terkurasi cerita rakyat pesisir barat Sumatera yang memuat naskah asli, alih bahasa Indonesia modern, dan catatan nilai moral budaya maritim Minangkabau.',
      shelfLocation: 'Lantai 1 · Pojok Budaya & Sastra S-804',
      durationOrPages: '224 halaman · Edisi Ilustrasi',
      sampleExcerpt:
        'Legenda Pantai Air Manis: Di sebuah perkampungan nelayan yang teduh di kaki Bukit Padang, hiduplah Mande Rubayah bersama putra tunggalnya yang gemar memandang layar kapal dagang menuju selat...',
      createdAt: getRelativeDateISO(-20),
    },
    {
      id: 'col-010',
      title: 'Jejak Pergerakan Kebangsaan & Sejarah Pers Awal Abad ke-20',
      author: 'Pramoedya Ananta Toer & Dr. Hilmar Farid',
      publisher: 'Lentera Dipantara',
      year: 2023,
      isbnIssn: '978-979-9731-55-0',
      ddcNumber: '959.802',
      ddcCategory: '900',
      callNumber: '959.802 TOE j',
      format: 'Audiobook',
      subject: 'Sejarah Indonesia, Pergerakan Nasional, Sejarah Pers',
      totalCopies: 3,
      availableCopies: 3,
      synopsis:
        'Rekaman audio dokumenter dan pembacaan naskah sejarah kebangkitan pers bumiputra sebagai motor kesadaran nasional pada periode 1900–1928 di Hindia Belanda.',
      shelfLocation: 'Koleksi Audio Digital · Arsip Sejarah H-09',
      durationOrPages: '8 jam 15 menit · 12 Episode Audio',
      sampleExcerpt:
        'Episode 1 — Surat Kabar Pertama di Kota Pelabuhan: Ketika mesin cetak mulai menyuarakan gagasan emansipasi dalam bahasa Melayu pasar, ruang publik baru pun lahir di tengah masyarakat kolonial...',
      createdAt: getRelativeDateISO(-15),
    },
  ];

  const members: Member[] = [
    {
      id: 'mem-001',
      memberCode: 'MEM-2026-001',
      name: 'Nadia Putri Maharani',
      category: 'Mahasiswa Ilmu Perpustakaan',
      email: 'nadia.putri@perpus-digital.id',
      joinedAt: '2025-09-12',
      status: 'Aktif',
    },
    {
      id: 'mem-002',
      memberCode: 'MEM-2026-002',
      name: 'Dimas Pratama Wijaya',
      category: 'Peneliti & Dosen Muda',
      email: 'dimas.pratama@perpus-digital.id',
      joinedAt: '2025-11-04',
      status: 'Aktif',
    },
    {
      id: 'mem-003',
      memberCode: 'MEM-2026-003',
      name: 'Siti Rahmawati',
      category: 'Anggota Umum',
      email: 'siti.rahmawati@perpus-digital.id',
      joinedAt: '2026-01-19',
      status: 'Aktif',
    },
  ];

  // 5 Initial Transactions covering Active, Overdue, and Returned states across recent days
  // Synced with availableCopies above:
  // col-001: 1 active loan (5 -> 4)
  // col-002: 1 overdue loan (3 -> 2)
  // col-004: 1 active loan (4 -> 3)
  const transactions: Transaction[] = [
    {
      id: 'TRX-2026-101',
      memberId: 'mem-001',
      collectionId: 'col-001',
      borrowDate: getRelativeDateISO(0),
      dueDate: getRelativeDateISO(7),
      returnDate: null,
      status: 'active',
    },
    {
      id: 'TRX-2026-102',
      memberId: 'mem-002',
      collectionId: 'col-002',
      borrowDate: getRelativeDateISO(-10),
      dueDate: getRelativeDateISO(-3),
      returnDate: null,
      status: 'active', // Evaluates to 'Terlambat' dynamically
    },
    {
      id: 'TRX-2026-103',
      memberId: 'mem-003',
      collectionId: 'col-004',
      borrowDate: getRelativeDateISO(-2),
      dueDate: getRelativeDateISO(5),
      returnDate: null,
      status: 'active',
    },
    {
      id: 'TRX-2026-104',
      memberId: 'mem-001',
      collectionId: 'col-006',
      borrowDate: getRelativeDateISO(-5),
      dueDate: getRelativeDateISO(2),
      returnDate: getRelativeDateISO(-1),
      status: 'returned',
    },
    {
      id: 'TRX-2026-105',
      memberId: 'mem-002',
      collectionId: 'col-009',
      borrowDate: getRelativeDateISO(-4),
      dueDate: getRelativeDateISO(3),
      returnDate: getRelativeDateISO(0),
      status: 'returned',
    },
  ];

  return {
    collections,
    members,
    transactions,
    activeRole: 'member',
    activeMemberId: 'mem-001',
  };
}
