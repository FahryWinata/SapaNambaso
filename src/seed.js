'use strict';

const crypto = require('node:crypto');

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const parts = String(storedHash || '').split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  const actualBuf = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512');
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

function buildGoogleMapsDirectionsUrl(name, address) {
  const parts = [String(name || '').trim(), String(address || '').trim()].filter(Boolean);
  const destination = parts.length ? parts.join(', ') : 'Samsat Palu, Sulawesi Tengah';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

function createInitialMedia() {
  const now = new Date().toISOString();
  return [
    {
      id: 'media-logo-sapa',
      filename: 'logo-sapa-nambaso-placeholder.svg',
      url: '/assets/placeholders/logo-sapa-nambaso.svg',
      alt: 'Penampung sementara logo resmi SAPA NAMBASO Samsat Palu',
      width: 180,
      height: 48,
      sizeBytes: 1024,
      mimeType: 'image/svg+xml',
      uploadedAt: now,
      isPlaceholder: true
    },
    {
      id: 'media-logo-instansi',
      filename: 'logo-instansi-placeholder.svg',
      url: '/assets/placeholders/logo-instansi.svg',
      alt: 'Penampung sementara logo instansi Bapenda Sulawesi Tengah dan Samsat Palu',
      width: 180,
      height: 48,
      sizeBytes: 1024,
      mimeType: 'image/svg+xml',
      uploadedAt: now,
      isPlaceholder: true
    },
    {
      id: 'media-hero-kantor',
      filename: 'foto-kantor-induk-placeholder.svg',
      url: '/assets/placeholders/foto-kantor-induk.svg',
      alt: 'Penampung foto Gedung Kantor Induk Samsat Palu di Jl. Kartini yang disediakan petugas',
      width: 640,
      height: 420,
      sizeBytes: 2048,
      mimeType: 'image/svg+xml',
      uploadedAt: now,
      isPlaceholder: true
    },
    {
      id: 'media-struktur-org',
      filename: 'struktur-organisasi-placeholder.svg',
      url: '/assets/placeholders/struktur-organisasi.svg',
      alt: 'Penampung bagan struktur organisasi UPTB Pendapatan Daerah Wilayah I Palu',
      width: 720,
      height: 400,
      sizeBytes: 2048,
      mimeType: 'image/svg+xml',
      uploadedAt: now,
      isPlaceholder: true
    },
    {
      id: 'media-lokasi-default',
      filename: 'foto-lokasi-placeholder.svg',
      url: '/assets/placeholders/foto-lokasi.svg',
      alt: 'Penampung foto lokasi layanan Samsat Palu yang diunggah petugas melalui panel admin',
      width: 480,
      height: 300,
      sizeBytes: 1536,
      mimeType: 'image/svg+xml',
      uploadedAt: now,
      isPlaceholder: true
    },
    {
      id: 'media-foto-pejabat',
      filename: 'foto-pejabat-placeholder.svg',
      url: '/assets/placeholders/foto-pejabat.svg',
      alt: 'Penampung foto profil pejabat struktural UPTB Samsat Palu',
      width: 320,
      height: 400,
      sizeBytes: 1536,
      mimeType: 'image/svg+xml',
      uploadedAt: now,
      isPlaceholder: true
    },
    {
      id: 'media-partner-bapenda',
      filename: 'bapenda-sulteng.png',
      url: '/assets/partners/bapenda-sulteng.png',
      alt: 'Logo Pemerintah Provinsi Sulawesi Tengah dan Bapenda Sulteng',
      width: 147,
      height: 190,
      sizeBytes: 18432,
      mimeType: 'image/png',
      uploadedAt: now,
      isPlaceholder: true
    },
    {
      id: 'media-partner-ditlantas',
      filename: 'ditlantas.png',
      url: '/assets/partners/ditlantas.png',
      alt: 'Logo Ditlantas Korlantas Polri',
      width: 213,
      height: 192,
      sizeBytes: 22528,
      mimeType: 'image/png',
      uploadedAt: now,
      isPlaceholder: true
    },
    {
      id: 'media-partner-jasaraharja',
      filename: 'jasa-raharja.png',
      url: '/assets/partners/jasa-raharja.png',
      alt: 'Logo PT Jasa Raharja',
      width: 213,
      height: 162,
      sizeBytes: 16384,
      mimeType: 'image/png',
      uploadedAt: now,
      isPlaceholder: true
    }
  ];
}

function createDefaultSamsatKeliling() {
  return [
    {
      id: 'sk-senin-kamis',
      enabled: true,
      dayLabel: 'Senin s.d. Kamis',
      timeRange: '08.30 s.d. 13.00 WITA',
      location: 'Area Taman GOR / Jl. Moh. Hatta, Kota Palu',
      serviceScope: 'Pengesahan Pajak Tahunan dan Cetak SKPD',
      note: 'Siapkan STNK asli dan KTP pemilik kendaraan.'
    },
    {
      id: 'sk-jumat',
      enabled: true,
      dayLabel: 'Jumat',
      timeRange: '08.30 s.d. 11.30 WITA',
      location: 'Lapangan Vatulemo, Kota Palu',
      serviceScope: 'Pengesahan Pajak Tahunan dan Konsultasi Pajak',
      note: 'Berhenti sementara saat waktu salat Jumat.'
    },
    {
      id: 'sk-sabtu',
      enabled: true,
      dayLabel: 'Sabtu',
      timeRange: '08.30 s.d. 12.00 WITA',
      location: 'Pusat Keramaian Kota Palu (Jadwal Rutin Akhir Pekan)',
      serviceScope: 'Pengesahan Pajak Tahunan',
      note: 'Lokasi titik akhir pekan dapat menyesuaikan agenda kota.'
    }
  ];
}

function createDefaultAnnouncements() {
  return [
    {
      id: 'ann-layanan-sabtu',
      enabled: true,
      category: 'Pengumuman',
      title: 'Pelayanan Samsat Palu Tetap Buka Hari Sabtu',
      message: 'Wajib pajak dapat mengurus pengesahan pajak tahunan di Kantor Induk dan Samsat Drive Thru pada hari Sabtu pukul 08.00 s.d. 12.00 WITA.',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      imageId: 'media-hero-kantor',
      imageFit: 'cover',
      ctaLabel: 'Lihat Jam Layanan',
      ctaUrl: '#jam-layanan'
    },
    {
      id: 'ann-gerai-keliling',
      enabled: true,
      category: 'Event Layanan',
      title: 'Perluasan Titik Layanan Gerai Corner dan Drive Thru',
      message: 'Manfaatkan layanan cepat tanpa turun dari kendaraan di Samsat Drive Thru serta gerai corner Thamrin, MPP, Bambaru, dan Songgolangi.',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      imageId: 'media-lokasi-default',
      imageFit: 'cover',
      ctaLabel: 'Lihat Lokasi Gerai',
      ctaUrl: '#lokasi'
    },
    {
      id: 'ann-cek-pajak-daring',
      enabled: true,
      category: 'Informasi Pajak',
      title: 'Cek Estimasi Pajak Kendaraan Secara Daring Sebelum ke Loket',
      message: 'Periksa besaran PKB dan siapkan dokumen asli (KTP, STNK, BPKB bila 5 tahunan) sebelum berkunjung melalui portal resmi Bapenda Sulawesi Tengah.',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      imageId: 'media-hero-kantor',
      imageFit: 'cover',
      ctaLabel: 'Buka Portal Cek Pajak',
      ctaUrl: 'https://bapenda.sultengprov.go.id/pkbv2'
    }
  ];
}

function createInitialContent() {
  const now = new Date().toISOString();
  return {
    identity: {
      siteName: 'SAPA NAMBASO',
      siteFullName: 'Sistem Akses Pelayanan Administrasi Nambaso',
      tagline: 'Informasi layanan pajak kendaraan bermotor UPTB Pendapatan Daerah Wilayah I Palu (Samsat Palu)',
      ownerName: 'UPTB Pendapatan Daerah Wilayah I Palu, Bapenda Provinsi Sulawesi Tengah',
      siteLogoId: 'media-logo-sapa',
      agencyLogoId: 'media-logo-instansi',
      faviconUrl: '/assets/placeholders/logo-sapa-nambaso.svg',
      sharePreviewImageId: 'media-hero-kantor',
      themeColor: '#38BDF8',
      themeStyle: 'gradient',
      splashEnabled: true,
      splashShowText: true,
      splashImageId: 'media-logo-sapa',
      splashTitle: 'Selamat Datang di SAPA NAMBASO',
      splashSubtitle: 'UPTB Pendapatan Daerah Wilayah I Palu (Samsat Palu)'
    },
    hero: {
      title: 'SAPA NAMBASO',
      subtitle: 'Informasi resmi layanan Samsat Palu: cek persyaratan, tarif PNBP, jam layanan WITA, dan lokasi kantor sebelum Anda datang.',
      primaryCtaLabel: 'Cek Pajak Kendaraan',
      secondaryLocationLabel: 'Lihat Lokasi Kantor',
      secondaryContactLabel: 'Hubungi Petugas',
      heroImageId: 'media-hero-kantor',
      heroCaption: 'Kantor Induk Samsat Palu, Jl. Kartini, Lolu Utara, Kota Palu.'
    },
    taxCheck: {
      targetUrl: 'https://bapenda.sultengprov.go.id/pkbv2',
      buttonLabel: 'Cek Pajak Kendaraan',
      redirectNotice: 'Anda akan diarahkan ke laman resmi Badan Pendapatan Daerah Provinsi Sulawesi Tengah (bapenda.sultengprov.go.id/pkbv2) di tab baru. Situs SAPA NAMBASO tidak meminta atau menyimpan nomor polisi maupun NIK Anda.',
      lastCheckedAt: null,
      lastCheckStatus: 'Belum diperiksa'
    },
    profile: {
      sectionTitle: 'Profil Instansi',
      aboutTitle: 'UPTB Pendapatan Daerah Wilayah I Palu',
      aboutText: 'UPTB Pendapatan Daerah Wilayah I Palu (Samsat Palu) merupakan unit pelaksana teknis di bawah Badan Pendapatan Daerah Provinsi Sulawesi Tengah yang melayani administrasi dan pembayaran pajak kendaraan bermotor bagi masyarakat Kota Palu dan sekitarnya bersama Kepolisian Daerah Sulawesi Tengah serta PT Jasa Raharja.',
      vision: 'Menjadi penyelenggara pelayanan pajak kendaraan bermotor yang profesional, modern, dan terpercaya.',
      missions: [
        'Memberikan pelayanan yang cepat dan mudah bagi wajib pajak.',
        'Meningkatkan kepatuhan wajib pajak di wilayah Kota Palu.',
        'Mewujudkan pelayanan yang transparan dan akuntabel.',
        'Mengembangkan pelayanan informasi dan administrasi berbasis digital.'
      ],
      orgStructureTitle: 'Struktur Organisasi',
      orgStructureImageId: 'media-struktur-org',
      orgRoles: [
        {
          id: 'pejabat-kepala-uptb',
          role: 'Kepala UPTB Pendapatan Daerah Wilayah I Palu',
          holder: '[DATA NAMA PEJABAT DIISI PETUGAS]',
          photoId: 'media-foto-pejabat',
          tagline: 'Mengenal Lebih Dekat Kepala UPTB Pendapatan Daerah Wilayah I Palu',
          bio: 'Memimpin penyelenggaraan layanan administrasi dan pemungutan Pajak Kendaraan Bermotor di wilayah kerja Kota Palu dengan berorientasi pada kemudahan wajib pajak, transparansi tarif, dan penguatan layanan informasi digital melalui portal SAPA NAMBASO.'
        },
        {
          id: 'pejabat-kasubbag-tu',
          role: 'Kepala Subbagian Tata Usaha',
          holder: '[DATA NAMA PEJABAT DIISI PETUGAS]',
          photoId: 'media-foto-pejabat',
          tagline: 'Mengenal Lebih Dekat Kepala Subbagian Tata Usaha Samsat Palu',
          bio: 'Mengelola dukungan administrasi umum, kepegawaian, perlengkapan loket, sarana prasarana gerai, dan koordinasi persuratan guna menjaga kelancaran operasional harian UPTB Wilayah I Palu.'
        },
        {
          id: 'pejabat-kasi-penetapan',
          role: 'Kepala Seksi Penetapan dan Penerimaan',
          holder: '[DATA NAMA PEJABAT DIISI PETUGAS]',
          photoId: 'media-foto-pejabat',
          tagline: 'Mengenal Lebih Dekat Kepala Seksi Penetapan dan Penerimaan Samsat Palu',
          bio: 'Bertanggung jawab atas ketepatan verifikasi objek pajak, penetapan nilai PKB dan BBNKB, publikasi komponen biaya PNBP resmi, serta pelaporan penerimaan harian di Kantor Induk dan gerai layanan.'
        },
        {
          id: 'pejabat-kasi-penagihan',
          role: 'Kepala Seksi Penagihan dan Pengawasan',
          holder: '[DATA NAMA PEJABAT DIISI PETUGAS]',
          photoId: 'media-foto-pejabat',
          tagline: 'Mengenal Lebih Dekat Kepala Seksi Penagihan dan Pengawasan Samsat Palu',
          bio: 'Mengkoordinasikan sosialisasi kepatuhan pajak kendaraan bermotor, perluasan titik layanan gerai corner, pemantauan tunggakan, serta peningkatan kualitas pengawasan layanan di lapangan.'
        }
      ]
    },
    services: [
      {
        id: 'layanan-pajak-tahunan',
        order: 1,
        active: true,
        name: 'Pajak Tahunan',
        summary: 'Pengesahan STNK tahunan serta pembayaran PKB dan SWDKLLJ.',
        updatedAt: now,
        imageId: 'media-lokasi-default',
        pnbpFees: [
          { item: 'Pengesahan STNK Roda 2 atau Roda 3', amount: '[DATA RESMI DIISI PETUGAS]', note: 'Sesuai ketentuan PNBP Polri dan PKB daerah' },
          { item: 'Pengesahan STNK Roda 4 atau lebih', amount: '[DATA RESMI DIISI PETUGAS]', note: 'Sesuai ketentuan PNBP Polri dan PKB daerah' }
        ],
        requirements: [
          '[DATA RESMI DIISI PETUGAS] KTP asli pemilik kendaraan yang masih berlaku',
          '[DATA RESMI DIISI PETUGAS] STNK asli dan lembar SKPD terakhir'
        ]
      },
      {
        id: 'layanan-stnk-5-tahun',
        order: 2,
        active: true,
        name: 'Pergantian STNK 5 Tahun',
        summary: 'Perpanjangan STNK lima tahunan, cek fisik kendaraan, dan penerbitan TNKB baru.',
        updatedAt: now,
        imageId: 'media-lokasi-default',
        pnbpFees: [
          { item: 'Penerbitan STNK Baru (Roda 2 / Roda 4)', amount: '[DATA RESMI DIISI PETUGAS]', note: 'Ditambah biaya TNKB sesuai ketentuan resmi' },
          { item: 'Penerbitan TNKB (Pelat Nomor)', amount: '[DATA RESMI DIISI PETUGAS]', note: 'Dilayani di Kantor Induk Samsat Palu' }
        ],
        requirements: [
          '[DATA RESMI DIISI PETUGAS] Menghadirkan kendaraan untuk cek fisik di Kantor Induk',
          '[DATA RESMI DIISI PETUGAS] KTP asli, STNK asli, dan BPKB asli'
        ]
      },
      {
        id: 'layanan-mutasi-masuk',
        order: 3,
        active: true,
        name: 'Mutasi Masuk',
        summary: 'Pendaftaran kendaraan yang pindah masuk dari luar daerah ke wilayah hukum Kota Palu.',
        updatedAt: now,
        imageId: 'media-lokasi-default',
        pnbpFees: [
          { item: 'Penerbitan STNK, TNKB, dan BPKB Mutasi Masuk', amount: '[DATA RESMI DIISI PETUGAS]', note: 'Tarif BBNKB dan PNBP diisi petugas' }
        ],
        requirements: [
          '[DATA RESMI DIISI PETUGAS] Berkas arsip mutasi dari Samsat asal dan surat fiskal',
          '[DATA RESMI DIISI PETUGAS] Cek fisik kendaraan, KTP pemilik baru, dan BPKB asli'
        ]
      },
      {
        id: 'layanan-mutasi-keluar',
        order: 4,
        active: true,
        name: 'Mutasi Keluar',
        summary: 'Pengurusan berkas cabut registrasi kendaraan yang pindah keluar dari Kota Palu.',
        updatedAt: now,
        imageId: 'media-lokasi-default',
        pnbpFees: [
          { item: 'Surat Keterangan Fiskal dan Mutasi Keluar', amount: '[DATA RESMI DIISI PETUGAS]', note: 'Pelunasan PKB berjalan wajib diselesaikan' }
        ],
        requirements: [
          '[DATA RESMI DIISI PETUGAS] KTP pemilik, STNK asli, dan BPKB asli',
          '[DATA RESMI DIISI PETUGAS] Hasil cek fisik kendaraan di Kantor Induk Samsat Palu'
        ]
      },
      {
        id: 'layanan-kendaraan-baru',
        order: 5,
        active: true,
        name: 'Kendaraan Baru',
        summary: 'Registrasi dan penetapan pajak pertama bagi kendaraan bermotor baru.',
        updatedAt: now,
        imageId: 'media-lokasi-default',
        pnbpFees: [
          { item: 'Penerbitan STNK dan TNKB Kendaraan Baru', amount: '[DATA RESMI DIISI PETUGAS]', note: 'Ditambah BBNKB I dan PKB sesuai NJKB' }
        ],
        requirements: [
          '[DATA RESMI DIISI PETUGAS] Faktur kendaraan, sertifikat NIK atau SRUT, dan KTP pemilik',
          '[DATA RESMI DIISI PETUGAS] Cek fisik nomor rangka dan nomor mesin'
        ]
      },
      {
        id: 'layanan-balik-nama',
        order: 6,
        active: true,
        name: 'Balik Nama',
        summary: 'Pengalihan kepemilikan kendaraan bermotor bekas (BBNKB II) atas nama pemilik baru.',
        updatedAt: now,
        imageId: 'media-lokasi-default',
        pnbpFees: [
          { item: 'PNBP STNK, BPKB, dan TNKB Balik Nama', amount: '[DATA RESMI DIISI PETUGAS]', note: 'Besaran BBNKB II sesuai ketentuan provinsi' }
        ],
        requirements: [
          '[DATA RESMI DIISI PETUGAS] KTP asli pemilik baru dan kwitansi pembelian bermeterai',
          '[DATA RESMI DIISI PETUGAS] STNK asli, BPKB asli, dan hasil cek fisik kendaraan'
        ]
      }
    ],
    hours: {
      timezoneLabel: 'WITA (Waktu Indonesia Tengah)',
      weekly: [
        { dayIndex: 1, dayName: 'Senin', isOpen: true, openTime: '08:00', closeTime: '15:00', displayText: '08.00 s.d. 15.00 WITA' },
        { dayIndex: 2, dayName: 'Selasa', isOpen: true, openTime: '08:00', closeTime: '15:00', displayText: '08.00 s.d. 15.00 WITA' },
        { dayIndex: 3, dayName: 'Rabu', isOpen: true, openTime: '08:00', closeTime: '15:00', displayText: '08.00 s.d. 15.00 WITA' },
        { dayIndex: 4, dayName: 'Kamis', isOpen: true, openTime: '08:00', closeTime: '15:00', displayText: '08.00 s.d. 15.00 WITA' },
        { dayIndex: 5, dayName: 'Jumat', isOpen: true, openTime: '08:00', closeTime: '15:00', displayText: '08.00 s.d. 15.00 WITA' },
        { dayIndex: 6, dayName: 'Sabtu', isOpen: true, openTime: '08:00', closeTime: '12:00', displayText: '08.00 s.d. 12.00 WITA' },
        { dayIndex: 0, dayName: 'Minggu', isOpen: false, openTime: '', closeTime: '', displayText: 'Tutup' }
      ],
      holidayNote: 'Hari libur nasional dan tanggal merah mengikuti ketetapan pemerintah (Tutup).',
      exceptions: [
        { id: 'hol-2026-12-25', date: '2026-12-25', title: 'Hari Raya Natal', status: 'closed', openTime: '', closeTime: '', note: 'Layanan loket dan gerai tutup.' }
      ]
    },
    locations: [
      {
        id: 'lok-kantor-induk',
        order: 1,
        isPrimary: true,
        name: 'Kantor Induk Samsat Palu',
        address: 'Jl. Kartini, Lolu Utara, Kec. Palu Selatan, Kota Palu, Sulawesi Tengah',
        hoursNote: 'Senin sampai Jumat 08.00 s.d. 15.00 WITA, Sabtu 08.00 s.d. 12.00 WITA',
        serviceScope: 'Semua layanan (Pajak Tahunan, 5 Tahunan, Cek Fisik, Mutasi, Balik Nama)',
        lat: -0.9016,
        lng: 119.8781,
        mapUrl: buildGoogleMapsDirectionsUrl('Kantor Induk Samsat Palu', 'Jl. Kartini, Lolu Utara, Kec. Palu Selatan, Kota Palu, Sulawesi Tengah'),
        imageId: 'media-hero-kantor'
      },
      {
        id: 'lok-drive-thru',
        order: 2,
        isPrimary: false,
        name: 'Samsat Drive Thru',
        address: 'Belakang Kantor Induk, Jl. Kartini, Lolu Utara, Kec. Palu Selatan, Kota Palu',
        hoursNote: 'Mengikuti jam layanan Kantor Induk',
        serviceScope: 'Pajak Tahunan tanpa turun dari kendaraan',
        lat: -0.902,
        lng: 119.8784,
        mapUrl: buildGoogleMapsDirectionsUrl('Samsat Drive Thru', 'Belakang Kantor Induk, Jl. Kartini, Lolu Utara, Kec. Palu Selatan, Kota Palu'),
        imageId: 'media-lokasi-default'
      },
      {
        id: 'lok-corner-thamrin',
        order: 3,
        isPrimary: false,
        name: 'Samsat Corner Thamrin',
        address: 'Jl. Moh. Thamrin No. 55, Besusu Tim., Kec. Palu Tim., Kota Palu',
        hoursNote: 'Senin sampai Jumat 08.00 s.d. 15.00 WITA, Sabtu 08.00 s.d. 12.00 WITA',
        serviceScope: 'Pengesahan Pajak Tahunan',
        lat: -0.8924,
        lng: 119.8768,
        mapUrl: buildGoogleMapsDirectionsUrl('Samsat Corner Thamrin', 'Jl. Moh. Thamrin No. 55, Besusu Tim., Kec. Palu Tim., Kota Palu'),
        imageId: 'media-lokasi-default'
      },
      {
        id: 'lok-mpp',
        order: 4,
        isPrimary: false,
        name: 'Gerai Mall Pelayanan Publik',
        address: 'Jl. Cik Ditiro No. 27-37, Besusu Tengah, Kec. Palu Tim., Kota Palu',
        hoursNote: 'Mengikuti jadwal operasional Mall Pelayanan Publik Kota Palu',
        serviceScope: 'Pengesahan Pajak Tahunan dan konsultasi informasi',
        lat: -0.8962,
        lng: 119.8779,
        mapUrl: buildGoogleMapsDirectionsUrl('Gerai Mall Pelayanan Publik', 'Jl. Cik Ditiro No. 27-37, Besusu Tengah, Kec. Palu Tim., Kota Palu'),
        imageId: 'media-lokasi-default'
      },
      {
        id: 'lok-bambaru',
        order: 5,
        isPrimary: false,
        name: 'Samsat Digital Bambaru',
        address: 'Baru, Kec. Palu Bar., Kota Palu 94221',
        hoursNote: 'Senin sampai Jumat 08.00 s.d. 15.00 WITA, Sabtu 08.00 s.d. 12.00 WITA',
        serviceScope: 'Pengesahan Pajak Tahunan dan layanan digital',
        lat: -0.8935,
        lng: 119.8583,
        mapUrl: buildGoogleMapsDirectionsUrl('Samsat Digital Bambaru', 'Baru, Kec. Palu Bar., Kota Palu 94221'),
        imageId: 'media-lokasi-default'
      },
      {
        id: 'lok-songgolangi',
        order: 6,
        isPrimary: false,
        name: 'Samsat Corner Songgolangi',
        address: 'Jl. I Gusti Ngurah Rai, Palupi, Kec. Tatanga, Kota Palu 94238',
        hoursNote: 'Senin sampai Jumat 08.00 s.d. 15.00 WITA, Sabtu 08.00 s.d. 12.00 WITA',
        serviceScope: 'Pengesahan Pajak Tahunan wilayah Palu Selatan dan Tatanga',
        lat: -0.9234,
        lng: 119.8689,
        mapUrl: buildGoogleMapsDirectionsUrl('Samsat Corner Songgolangi', 'Jl. I Gusti Ngurah Rai, Palupi, Kec. Tatanga, Kota Palu 94238'),
        imageId: 'media-lokasi-default'
      }
    ],
    contacts: {
      whatsappNumber: '0821-2854-4041',
      whatsappUrl: 'https://wa.me/6282128544041',
      phoneNumber: '0821-2854-4041',
      phoneUrl: 'tel:+6282128544041',
      email: 'uptb.wilayah1palu@gmail.com',
      instagramHandle: '@samsat_palu',
      instagramUrl: 'https://www.instagram.com/samsat_palu/',
      tiktokHandle: '@samsat_palu',
      tiktokUrl: 'https://www.tiktok.com/@samsat_palu',
      facebookName: 'samsat palu',
      facebookUrl: 'https://www.facebook.com/search/top?q=samsat%20palu',
      complaintTitle: 'Layanan Pengaduan dan Saran Masyarakat',
      complaintText: 'Sampaikan pertanyaan, kendala layanan loket, atau saran perbaikan secara langsung ke petugas UPTB Wilayah I Palu melalui WhatsApp resmi 0821-2854-4041 atau email uptb.wilayah1palu@gmail.com pada jam layanan WITA.'
    },
    announcements: createDefaultAnnouncements(),
    partners: [
      {
        id: 'mitra-bapenda',
        name: 'Bapenda Provinsi Sulawesi Tengah',
        url: 'https://bapenda.sultengprov.go.id',
        description: 'Portal resmi pajak daerah dan cek tagihan PKB Provinsi Sulawesi Tengah.',
        logoId: 'media-logo-instansi'
      },
      {
        id: 'mitra-ditlantas',
        name: 'Ditlantas Polda Sulawesi Tengah',
        url: 'https://korlantas.polri.go.id',
        description: 'Instansi pembina registrasi, identifikasi kendaraan bermotor, STNK, dan TNKB.',
        logoId: 'media-logo-instansi'
      },
      {
        id: 'mitra-jasaraharja',
        name: 'PT Jasa Raharja',
        url: 'https://www.jasaraharja.co.id',
        description: 'Pengelola Sumbangan Wajib Dana Kecelakaan Lalu Lintas Jalan (SWDKLLJ).',
        logoId: 'media-logo-instansi'
      },
      {
        id: 'mitra-signal',
        name: 'Samsat Digital Nasional (SIGNAL)',
        url: 'https://samsatdigital.id',
        description: 'Layanan pengesahan STNK tahunan secara daring tingkat nasional.',
        logoId: 'media-logo-sapa'
      }
    ],
    faq: [
      {
        id: 'faq-pembayaran',
        question: 'Apakah saya bisa langsung membayar pajak atau memasukkan nomor polisi di website SAPA NAMBASO?',
        answer: 'Tidak. Website SAPA NAMBASO menyajikan informasi persyaratan, estimasi tarif PNBP, jam layanan, dan lokasi kantor. Untuk memeriksa nilai pajak atau melanjutkan layanan daring, gunakan tombol Cek Pajak Kendaraan yang mengarah ke laman resmi Bapenda Sulawesi Tengah.'
      },
      {
        id: 'faq-lokasi-cek-fisik',
        question: 'Lokasi mana saja yang melayani cek fisik untuk STNK 5 tahunan, mutasi, atau balik nama?',
        answer: 'Layanan cek fisik kendaraan, mutasi masuk atau keluar, kendaraan baru, dan balik nama dilayani di Kantor Induk Samsat Palu di Jl. Kartini, Lolu Utara. Gerai Thamrin, Mall Pelayanan Publik, Bambaru, Songgolangi, dan Drive Thru berfokus pada pengesahan pajak tahunan.'
      },
      {
        id: 'faq-jam-sabtu',
        question: 'Apakah Samsat Palu tetap buka pada hari Sabtu?',
        answer: 'Ya, loket reguler melayani pada hari Sabtu pukul 08.00 s.d. 12.00 WITA, kecuali jika bertepatan dengan hari libur nasional atau penyesuaian jadwal yang diumumkan melalui panel ini.'
      }
    ],
    seo: {
      pageTitle: 'SAPA NAMBASO | Informasi Resmi Layanan Samsat Palu',
      metaDescription: 'Portal resmi UPTB Pendapatan Daerah Wilayah I Palu (Samsat Palu): cek pajak kendaraan Bapenda Sulteng, rincian layanan PNBP, persyaratan, jam layanan WITA, dan lokasi gerai di Kota Palu.',
      sectionTitles: {
        announcements: 'Berita, Event, dan Pengumuman',
        hours: 'Jam Layanan WITA',
        samsatKeliling: 'Jadwal Samsat Keliling',
        services: 'Jenis Layanan, Biaya PNBP, dan Persyaratan',
        profile: 'Profil UPTB Pendapatan Daerah Wilayah I Palu',
        locations: 'Lokasi Kantor Induk dan Gerai Samsat Palu',
        contacts: 'Kontak Resmi dan Pengaduan',
        faq: 'Pertanyaan yang Sering Diajukan',
        partners: 'Tautan Terkait dan Instansi Mitra'
      }
    },
    samsatKeliling: createDefaultSamsatKeliling()
  };
}

function createInitialUsers() {
  const now = new Date().toISOString();
  return [
    {
      id: 'usr-super-admin',
      name: 'Super Admin Samsat Palu',
      email: 'admin@samsatpalu.go.id',
      role: 'Super Admin',
      active: true,
      passwordHash: hashPassword('SapaNambaso#2026'),
      totpSecret: 'JBSWY3DPEHPK3PXP',
      createdAt: now
    }
  ];
}

function createInitialDatabase() {
  const initialContent = createInitialContent();
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    publishedContent: structuredClone(initialContent),
    draftContent: structuredClone(initialContent),
    publishedAt: now,
    publishedBy: 'admin@samsatpalu.go.id',
    media: createInitialMedia(),
    users: createInitialUsers(),
    revisions: [
      {
        id: 'rev-initial',
        timestamp: now,
        actorEmail: 'admin@samsatpalu.go.id',
        actorName: 'Petugas Super Admin Samsat Palu',
        actorRole: 'Super Admin',
        summary: 'Inisialisasi konten awal sesuai PRD Section 10',
        snapshot: structuredClone(initialContent)
      }
    ],
    analytics: {
      dailySaltDate: now.slice(0, 10),
      dailySalt: crypto.randomBytes(16).toString('hex'),
      events: []
    },
    settings: {
      stalenessAlertDays: 90
    }
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  buildGoogleMapsDirectionsUrl,
  createInitialDatabase,
  createInitialContent,
  createDefaultAnnouncements,
  createDefaultSamsatKeliling,
  createInitialMedia,
  createInitialUsers
};

