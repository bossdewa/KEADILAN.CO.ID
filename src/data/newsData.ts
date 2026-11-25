export type NewsCategory =
  | 'Sorot'
  | 'Hukum'
  | 'Umum'
  | 'Politik'
  | 'Daerah'
  | 'Ekonomi'
  | 'Teknologi';

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: NewsCategory;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  views: number;
  featured?: boolean;
  artworkVariant: 'courthouse' | 'capitol' | 'harbor' | 'archive' | 'cityscape' | 'press';
  content: string[];
  pullQuote?: string;
}

export interface AuthorProfile {
  name: string;
  role: string;
  initials: string;
  accentColor: string;
  bio: string;
}

export const AUTHOR_PROFILES: Record<string, AuthorProfile> = {
  'Asep Maulana': {
    name: 'Asep Maulana',
    role: 'Pemimpin Redaksi',
    initials: 'AM',
    accentColor: '#0F2A44',
    bio: 'Memimpin meja redaksi KEADILAN.CO.ID dengan fokus peliputan reformasi peradilan, kode etik pers, dan tata kelola media siber di Jawa Barat.',
  },
  'Raka Pratama': {
    name: 'Raka Pratama',
    role: 'Redaktur Daerah',
    initials: 'RP',
    accentColor: '#16A085',
    bio: 'Meliput isu pembangunan infrastruktur, ekonomi pesisir, serta transformasi layanan publik desa di kawasan Ciayumajakuning.',
  },
  'Nadia Kusuma': {
    name: 'Nadia Kusuma',
    role: 'Jurnalis Politik',
    initials: 'NK',
    accentColor: '#1E3A8A',
    bio: 'Mengikuti dinamika kebijakan publik, pengawasan anggaran legislatif daerah, dan koordinasi transportasi antarkabupaten.',
  },
  'Dian Permana': {
    name: 'Dian Permana',
    role: 'Koresponden Lapangan',
    initials: 'DP',
    accentColor: '#14532D',
    bio: 'Berpengalaman melaporkan liputan lapangan seputar masyarakat pesisir Pantura, keselamatan maritim, dan literasi media komunitas.',
  },
  'Siti Nurhaliza': {
    name: 'Siti Nurhaliza',
    role: 'Redaktur Hukum & Ekonomi',
    initials: 'SN',
    accentColor: '#7C2D12',
    bio: 'Mengulas aspek legalitas usaha, perlindungan kekayaan intelektual UMKM, dan regulasi perdagangan ritel daerah.',
  },
  'Bagus Hidayat': {
    name: 'Bagus Hidayat',
    role: 'Kontributor Umum',
    initials: 'BH',
    accentColor: '#3F3F46',
    bio: 'Menulis laporan humaniora, penataan ruang terbuka publik, serta perkembangan ekonomi kreatif warga di Cirebon.',
  },
  'Fajar Nugroho': {
    name: 'Fajar Nugroho',
    role: 'Redaktur Teknologi',
    initials: 'FN',
    accentColor: '#0F766E',
    bio: 'Mengamati transformasi digital layanan publik, keamanan siber daerah, dan adopsi teknologi bagi pelaku usaha di Jawa Barat.',
  },
};

export interface BreakingNewsItem {
  id: string;
  label: NewsCategory | 'Terkini';
  text: string;
  articleId?: string;
  active: boolean;
}

export interface TickerPresetColor {
  name: string;
  hex: string;
}

export interface TickerConfig {
  duration: number;
  backgroundColor: string;
  isPaused: boolean;
  autoCycle?: boolean;
  autoCycleInterval?: number;
}

export const TICKER_COLOR_PRESETS: TickerPresetColor[] = [
  { name: 'Merah Redaksi', hex: '#B91C1C' },
  { name: 'Navy Keadilan', hex: '#0F2A44' },
  { name: 'Toska Tema', hex: '#16A085' },
  { name: 'Hitam Ink', hex: '#18181B' },
  { name: 'Terakota', hex: '#9A3412' },
  { name: 'Biru Lapis', hex: '#1E3A8A' },
  { name: 'Emas Amber', hex: '#D97706' },
  { name: 'Hutan Gelap', hex: '#14532D' },
];

export const INITIAL_BREAKING_ITEMS: BreakingNewsItem[] = [
  {
    id: 'bn-1',
    label: 'Hukum',
    text: 'Mahkamah Agung luncurkan sistem pemantauan perkara elektronik terintegrasi di seluruh pengadilan negeri Jawa Barat',
    articleId: 'art-1',
    active: true,
  },
  {
    id: 'bn-2',
    label: 'Daerah',
    text: 'Revitalisasi kawasan pelabuhan Cirebon dan koridor ekonomi Pantura ditargetkan rampung kuartal ketiga tahun ini',
    articleId: 'art-2',
    active: true,
  },
  {
    id: 'bn-3',
    label: 'Politik',
    text: 'DPRD bersama pemerintah daerah sepakat perkuat transparansi anggaran publik melalui portal data terbuka daerah',
    articleId: 'art-3',
    active: true,
  },
  {
    id: 'bn-4',
    label: 'Umum',
    text: 'BMKG keluarkan prakiraan cuaca maritim dan imbauan kewaspadaan gelombang tinggi bagi nelayan pesisir utara',
    articleId: 'art-4',
    active: true,
  },
  {
    id: 'bn-5',
    label: 'Sorot',
    text: 'Liputan Khusus: Menakar kesiapan UMKM Cirebon menembus pasar ekspor digital berbekal pendampingan hukum usaha',
    articleId: 'art-5',
    active: true,
  },
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'art-1',
    title: 'Transformasi Peradilan Elektronik: Akses Sidang Terbuka Kini Lebih Transparan Bagi Publik',
    excerpt:
      'Pembaruan sistem informasi penelusuran perkara memangkas waktu tunggu administrasi hingga 40 persen dan membuka akses jadwal sidang secara waktu nyata.',
    category: 'Sorot',
    author: 'Asep Maulana',
    authorRole: 'Pemimpin Redaksi',
    date: '24 Nov 2026',
    readTime: '5 mnt baca',
    views: 4820,
    featured: true,
    artworkVariant: 'courthouse',
    pullQuote:
      'Keadilan yang mudah diakses adalah fondasi kepercayaan publik terhadap supremasi hukum.',
    content: [
      'Upaya modernisasi administrasi peradilan di tingkat daerah memasuki babak baru dengan diluncurkannya sistem pemantauan perkara terpadu yang dapat diakses langsung oleh masyarakat maupun kuasa hukum.',
      'Melalui pembaruan infrastruktur digital ini, setiap tahapan persidangan mulai dari pendaftaran gugatan, penjadwalan sidang, hingga salinan putusan dapat dipantau secara kronologis tanpa harus mengantre di loket pengadilan.',
      'Sejumlah praktisi hukum menilai keterbukaan informasi perkara merupakan langkah krusial untuk menekan potensi sengketa prosedural sekaligus memastikan asas peradilan yang cepat, sederhana, dan berbiaya ringan benar-benar terwujud.',
      'Di wilayah Cirebon dan sekitarnya, sosialisasi penggunaan portal layanan hukum terpadu terus digencarkan bersama lembaga bantuan hukum kampus dan organisasi advokat setempat agar warga di tingkat desa pun memahami hak-hak proseduralnya.',
    ],
  },
  {
    id: 'art-2',
    title: 'Koridor Ekonomi Pantura dan Pelabuhan Cirebon Mulai Masuki Fase Integrasi Logistik',
    excerpt:
      'Penataan ulang jalur distribusi barang dan perluasan dermaga diharapkan memperkuat daya saing pelaku usaha lokal Jawa Barat bagian timur.',
    category: 'Sorot',
    author: 'Raka Pratama',
    authorRole: 'Redaktur Daerah',
    date: '24 Nov 2026',
    readTime: '4 mnt baca',
    views: 3910,
    featured: true,
    artworkVariant: 'harbor',
    pullQuote:
      'Integrasi pelabuhan dan jaringan jalan arteri menjadi kunci efisiensi rantai pasok wilayah timur.',
    content: [
      'Kawasan Pelabuhan Cirebon bersiap menjadi simpul logistik yang lebih efisien seiring berjalannya program penataan dermaga dan koneksi jalur angkut menuju kawasan industri di Ciayumajakuning.',
      'Pemerintah daerah mencatat bahwa kelancaran arus bongkar muat berkontribusi langsung terhadap stabilitas harga komoditas pangan serta biaya kirim produk kerajinan dan olahan laut dari pelaku UMKM.',
      'Selain pembangunan fisik, pelaku usaha juga menekankan pentingnya kepastian regulasi retribusi serta perlindungan tata ruang pesisir agar pertumbuhan ekonomi berjalan beriringan dengan kelestarian lingkungan.',
    ],
  },
  {
    id: 'art-3',
    title: 'DPRD Dorong Audit Partisipatif Anggaran Pendidikan dan Layanan Kesehatan Primer',
    excerpt:
      'Komisi pengawasan membuka kanal pelaporan masyarakat untuk memastikan realisasi program prioritas tepat sasaran hingga tingkat kecamatan.',
    category: 'Sorot',
    author: 'Nadia Kusuma',
    authorRole: 'Jurnalis Politik',
    date: '23 Nov 2026',
    readTime: '4 mnt baca',
    views: 3140,
    featured: true,
    artworkVariant: 'capitol',
    content: [
      'Pembahasan evaluasi anggaran tahun berjalan di gedung legislatif daerah menyoroti perlunya mekanisme umpan balik langsung dari warga terhadap kualitas fasilitas pendidikan dan puskesmas.',
      'Melalui skema audit partisipatif, dokumen ringkasan anggaran program kerja dipublikasikan lebih awal agar komite sekolah, tenaga medis, dan kelompok masyarakat sipil dapat membandingkan rencana dengan realisasi di lapangan.',
      'Pengamat kebijakan publik menilai langkah tersebut memperkuat akuntabilitas eksekutif-legislatif dan mencegah tumpang tindih proyek infrastruktur dasar.',
    ],
  },
  {
    id: 'art-4',
    title: 'Nelayan Pesisir Utara Diminta Waspadai Perubahan Cuaca dan Gelombang Tinggi',
    excerpt:
      'Otoritas pelabuhan bersama dinas kelautan menyiagakan pos informasi cuaca harian bagi kapal tradisional di sepanjang perairan Pantura.',
    category: 'Sorot',
    author: 'Dian Permana',
    authorRole: 'Koresponden Lapangan',
    date: '23 Nov 2026',
    readTime: '3 mnt baca',
    views: 2790,
    featured: true,
    artworkVariant: 'cityscape',
    content: [
      'Memasuki masa peralihan angin muson, otoritas keselamatan pelayaran mengingatkan para nakhoda kapal nelayan tradisional untuk memeriksa pembaruan prakiraan gelombang sebelum melaut.',
      'Koperasi nelayan di wilayah pesisir Cirebon telah memasang papan informasi cuaca harian yang diperbarui setiap enam jam sekaligus menyiapkan cadangan bahan bakar dan logistik darurat.',
      'Pemerintah daerah juga mengimbau seluruh pemilik kapal memastikan ketersediaan jaket pelampung serta alat komunikasi radio jarak dekat yang berfungsi baik.',
    ],
  },
  {
    id: 'art-5',
    title: 'Pendampingan Legalitas Usaha Bantu UMKM Cirebon Tembus Pasar Ritel Nasional',
    excerpt:
      'Kepemilikan nomor induk berusaha dan perlindungan merek dagang terbukti meningkatkan akses pembiayaan perbankan bagi perajin lokal.',
    category: 'Hukum',
    author: 'Siti Nurhaliza',
    authorRole: 'Redaktur Hukum & Ekonomi',
    date: '22 Nov 2026',
    readTime: '6 mnt baca',
    views: 2540,
    artworkVariant: 'archive',
    pullQuote:
      'Kepastian merek dan izin edar bukan sekadar formalitas, melainkan perisai nilai tambah produk lokal.',
    content: [
      'Klinik konsultasi hukum usaha yang digagas asosiasi UMKM bersama praktisi kenotariatan di Cirebon mencatat lonjakan permohonan pendaftaran merek dagang sepanjang semester kedua tahun ini.',
      'Selama ini, banyak produsen batik, olahan pangan, dan furnitur rotan terkendala saat hendak masuk jaringan ritel modern karena belum mengantongi sertifikat merek maupun perjanjian kemitraan tertulis yang baku.',
      'Melalui pendampingan gratis di tingkat kecamatan, pelaku usaha dibimbing menyusun kontrak dagang yang adil sekaligus memahami mekanisme penyelesaian sengketa niaga secara damai.',
    ],
  },
  {
    id: 'art-6',
    title: 'Kajian UU Pers dan Pedoman Media Siber: Menjaga Keberimbangan Berita di Era Cepat',
    excerpt:
      'Redaksi media daring menekankan verifikasi berlapis dan hak jawab guna melawan misinformasi di ruang digital.',
    category: 'Hukum',
    author: 'Asep Maulana',
    authorRole: 'Pemimpin Redaksi',
    date: '21 Nov 2026',
    readTime: '5 mnt baca',
    views: 2180,
    artworkVariant: 'press',
    content: [
      'Di tengah derasnya arus informasi media sosial, penerapan prinsip cover both sides tetap menjadi pembeda utama antara produk jurnalistik terverifikasi dengan kabar burung daring.',
      'Forum diskusi pers daerah menegaskan bahwa kecepatan tayang tidak boleh mengorbankan akurasi fakta, konfirmasi narasumber berwenang, serta perlindungan privasi warga.',
      'Media siber juga wajib menyediakan mekanisme hak jawab dan hak koreksi yang mudah diakses pembaca sebagai bagian dari tanggung jawab etik pers.',
    ],
  },
  {
    id: 'art-7',
    title: 'Penataan Ulang Sentra Kuliner dan Ruang Terbuka Publik di Kawasan Plumbon',
    excerpt:
      'Pemerintah kecamatan menyiapkan area pedestrian yang ramah keluarga sekaligus menata lapak pedagang agar tertib dan higienis.',
    category: 'Umum',
    author: 'Bagus Hidayat',
    authorRole: 'Kontributor Umum',
    date: '20 Nov 2026',
    readTime: '4 mnt baca',
    views: 1960,
    artworkVariant: 'cityscape',
    content: [
      'Proyek penataan ruang terbuka publik di koridor Plumbon memasuki tahap penyelesaian jalur pejalan kaki serta pemasangan penerangan hemat energi.',
      'Pedagang kuliner malam dilibatkan langsung dalam perancangan zona usaha agar sirkulasi lalu lintas tetap lancar sekaligus memberikan kenyamanan bagi pengunjung keluarga.',
      'Pengelola kawasan juga menempatkan fasilitas pemilahan sampah terpadu di setiap sudut taman untuk menjaga kebersihan lingkungan sekitar.',
    ],
  },
  {
    id: 'art-8',
    title: 'Digitalisasi Arsip Desa di Kabupaten Cirebon Percepat Layanan Administrasi Warga',
    excerpt:
      'Sebanyak 45 pemerintah desa mulai mengadopsi sistem surat-menyurat daring dan basis data kependudukan terstruktur.',
    category: 'Daerah',
    author: 'Raka Pratama',
    authorRole: 'Redaktur Daerah',
    date: '19 Nov 2026',
    readTime: '4 mnt baca',
    views: 1845,
    artworkVariant: 'archive',
    content: [
      'Transformasi layanan publik tingkat desa di Kabupaten Cirebon mulai menunjukkan hasil nyata setelah puluhan balai desa mengintegrasikan pencatatan administrasi warga ke dalam arsip digital lokal.',
      'Pengurusan surat keterangan domisili, pengantar usaha, hingga pencatatan aset desa kini dapat diselesaikan dalam hitungan menit dengan jejak audit yang rapi.',
      'Dinas pemberdayaan masyarakat turut menyelenggarakan pelatihan keamanan data bagi perangkat desa untuk mencegah kebocoran informasi pribadi warga.',
    ],
  },
  {
    id: 'art-9',
    title: 'Konsolidasi Kebijakan Transportasi Aglomerasi Ciayumajakuning Masuk Agenda Prioritas',
    excerpt:
      'Kepala daerah lintas kabupaten dan kota bahas integrasi rute angkutan umum pengumpan stasiun dan terminal regional.',
    category: 'Politik',
    author: 'Nadia Kusuma',
    authorRole: 'Jurnalis Politik',
    date: '18 Nov 2026',
    readTime: '5 mnt baca',
    views: 1720,
    artworkVariant: 'capitol',
    content: [
      'Pertemuan koordinasi antardaerah di kawasan Cirebon, Indramayu, Majalengka, dan Kuningan menyepakati perlunya penyelarasan trayek angkutan umum guna mengurangi kemacetan di jalur arteri.',
      'Rencana integrasi jadwal antara bus pengumpan dengan jadwal kereta api dan kawasan bandara diharapkan memudahkan mobilitas pekerja komuter maupun pelajar.',
      'Pembahasan lanjutan akan difokuskan pada skema subsidi operasional bersama serta standar pelayanan minimum armada angkutan.',
    ],
  },
  {
    id: 'art-10',
    title: 'Gerakan Literasi Media di Kampus dan Sekolah: Bekali Generasi Muda Saring Informasi',
    excerpt:
      'Pelatihan cek fakta dan etika berkomentar di ruang siber digelar serentak bersama pegiat jurnalisme warga.',
    category: 'Umum',
    author: 'Dian Permana',
    authorRole: 'Koresponden Lapangan',
    date: '17 Nov 2026',
    readTime: '4 mnt baca',
    views: 1510,
    artworkVariant: 'press',
    content: [
      'Ratusan pelajar dan mahasiswa mengikuti lokakarya literasi media yang membahas teknik memverifikasi sumber berita, mengenali manipulasi gambar, dan memahami etika bermedia daring.',
      'Para pemateri menekankan kebiasaan memeriksa tanggal terbit, kredibilitas redaksi, serta membaca isi berita secara utuh sebelum membagikan tautan ke grup percakapan.',
      'Kegiatan serupa dijadwalkan berlangsung secara berkala di berbagai kecamatan guna membangun ekosistem informasi publik yang sehat.',
    ],
  },
  {
    id: 'art-11',
    title: 'Ekspor Kerajinan Rotan dan Batik Tulis Cirebon Tumbuh 14 Persen Sepanjang Tahun Berjalan',
    excerpt:
      'Perluasan akses pembiayaan ekspor dan kurasi desain ramah lingkungan mendorong peningkatan permintaan dari pasar Asia Timur dan Eropa.',
    category: 'Ekonomi',
    author: 'Siti Nurhaliza',
    authorRole: 'Redaktur Hukum & Ekonomi',
    date: '22 Nov 2026',
    readTime: '4 mnt baca',
    views: 2390,
    artworkVariant: 'harbor',
    pullQuote:
      'Kualitas pengerjaan perajin lokal dan kepastian rantai pasok menjadi daya tawar utama di pasar global.',
    content: [
      'Sentra industri kreatif di Kabupaten Cirebon mencatatkan pertumbuhan nilai pengiriman produk kerajinan rotan serta batik tulis menuju sejumlah negara tujuan ekspor utama sepanjang tiga kuartal terakhir.',
      'Asosiasi eksportir daerah menyebut kolaborasi antara perajin tradisional dengan desainer muda berhasil menghasilkan lini produk berstandar sertifikasi bahan baku berkelanjutan yang diminati pembeli internasional.',
      'Di sisi lain, dukungan skema kredit usaha berorientasi ekspor dan penyederhanaan dokumen kepabeanan di pelabuhan regional membantu mempercepat perputaran modal kerja pelaku usaha menengah.',
    ],
  },
  {
    id: 'art-12',
    title: 'Digitalisasi Pasar Tradisional Dorong Transaksi Non-Tunai Pedagang Pangan di Pantura',
    excerpt:
      'Penerapan kode QR standar dan pencatatan stok harian memudahkan pedagang pasar rakyat mengakses kredit mikro perbankan.',
    category: 'Ekonomi',
    author: 'Raka Pratama',
    authorRole: 'Redaktur Daerah',
    date: '20 Nov 2026',
    readTime: '3 mnt baca',
    views: 1910,
    artworkVariant: 'cityscape',
    content: [
      'Sejumlah pasar rakyat di wilayah Cirebon dan Indramayu mulai mengoptimalkan sistem pembayaran digital terstandar guna mempermudah transaksi harian antara pedagang bahan pangan dan konsumen rumah tangga.',
      'Selain memangkas kebutuhan uang kembalian, catatan transaksi elektronik yang terekam rapi kini dimanfaatkan perbankan daerah sebagai dasar penilaian kelayakan pembiayaan modal mikro tanpa agunan berlebih.',
      'Pengelola pasar bekerja sama dengan dinas perdagangan terus mendampingi pedagang senior agar terbiasa memantau mutasi rekening dan menjaga keamanan perangkat transaksi.',
    ],
  },
  {
    id: 'art-13',
    title: 'Pemkab Siapkan Pusat Kendali Data Terpadu dan Pengamanan Sistem Layanan Publik Berbasis Awan',
    excerpt:
      'Integrasi server antarorganisasi perangkat daerah dirancang memangkas waktu pemrosesan perizinan sekaligus memperkuat ketahanan siber.',
    category: 'Teknologi',
    author: 'Fajar Nugroho',
    authorRole: 'Redaktur Teknologi',
    date: '23 Nov 2026',
    readTime: '4 mnt baca',
    views: 2640,
    artworkVariant: 'archive',
    pullQuote:
      'Kecepatan layanan digital harus selalu berjalan beriringan dengan perlindungan data pribadi warga.',
    content: [
      'Pemerintah daerah meresmikan tahap uji coba pusat kendali data terpadu yang menghubungkan aplikasi kependudukan, perizinan usaha, dan pengaduan masyarakat dalam satu arsitektur komputasi awan privat.',
      'Melalui konsolidasi sistem tersebut, pemohon layanan tidak perlu lagi mengunggah berkas identitas yang sama secara berulang di tiap instansi karena verifikasi berlangsung otomatis melalui pertukaran data terenkripsi.',
      'Tim tanggap insiden siber daerah juga disiagakan selama 24 jam untuk melakukan audit kerentanan berkala serta memastikan cadangan data terisolasi aman dari gangguan jaringan.',
    ],
  },
  {
    id: 'art-14',
    title: 'Inovasi Sensor Kualitas Air Tambak Bantu Petani Garam dan Bandeng Pesisir Tekan Risiko Gagal Panen',
    excerpt:
      'Perangkat pemantau salinitas dan suhu berbasis Internet of Things mengirimkan peringatan dini langsung ke ponsel petambak.',
    category: 'Teknologi',
    author: 'Fajar Nugroho',
    authorRole: 'Redaktur Teknologi',
    date: '18 Nov 2026',
    readTime: '4 mnt baca',
    views: 2050,
    artworkVariant: 'press',
    content: [
      'Kelompok pembudi daya ikan bandeng dan petani garam di pesisir timur Cirebon mulai memanfaatkan sensor pemantau kualitas air bertenaga surya yang terhubung dengan aplikasi pemantauan berbasis ponsel.',
      'Perangkat rakitan peneliti perguruan tinggi lokal tersebut membaca kadar keasaman, salinitas, serta oksigen terlarut setiap sepuluh menit agar petambak dapat segera mengatur pintu air saat cuaca berubah ekstrem.',
      'Uji lapangan selama dua musim panen menunjukkan penggunaan sistem peringatan dini ini mampu menekan angka kematian benih secara signifikan dan menstabilkan pendapatan kelompok tani pesisir.',
    ],
  },
  {
    id: 'art-15',
    title: 'Pos Bantuan Hukum Desa Diperluas untuk Percepat Mediasi Sengketa Agraria Warga',
    excerpt:
      'Layanan konsultasi hukum gratis di balai desa membantu warga menyelesaikan batas lahan secara musyawarah sebelum masuk jalur pengadilan.',
    category: 'Hukum',
    author: 'Asep Maulana',
    authorRole: 'Pemimpin Redaksi',
    date: '16 Nov 2026',
    readTime: '4 mnt baca',
    views: 1890,
    artworkVariant: 'courthouse',
    content: [
      'Kantor wilayah kementerian hukum bersama pemerintah kabupaten memperluas jaringan pos bantuan hukum tingkat desa di 20 kecamatan sepanjang jalur Pantura Cirebon.',
      'Melalui pendampingan paralegal terlatih, warga yang menghadapi persoalan dokumen kepemilikan tanah maupun waris dapat memperoleh panduan administrasi pertanahan tanpa biaya konsultasi.',
      'Pendekatan mediasi di tingkat lokal terbukti mampu menekan penumpukan perkara perdata ringan sekaligus menjaga kerukunan sosial antarwarga desa.',
    ],
  },
  {
    id: 'art-16',
    title: 'Sosialisasi Perlindungan Konsumen Transaksi Daring Digencarkan di Sentra Niaga Daerah',
    excerpt:
      'Otoritas pengawas perdagangan ingatkan pelaku toko daring mencantumkan informasi garansi serta mekanisme pengembalian barang secara jelas.',
    category: 'Hukum',
    author: 'Siti Nurhaliza',
    authorRole: 'Redaktur Hukum & Ekonomi',
    date: '15 Nov 2026',
    readTime: '3 mnt baca',
    views: 1620,
    artworkVariant: 'archive',
    content: [
      'Meningkatnya volume belanja elektronik mendorong badan penyelesaian sengketa konsumen mengadakan klinik edukasi hak pembeli dan kewajiban penjual di kawasan niaga Cirebon.',
      'Pelaku usaha diingatkan untuk mematuhi ketentuan pencantuman harga akhir, spesifikasi produk, serta prosedur pengaduan pelanggan yang mudah dihubungi.',
      'Konsumen juga didorong menyimpan bukti transaksi digital sebagai dokumen sah apabila terjadi ketidaksesuaian barang yang diterima.',
    ],
  },
  {
    id: 'art-17',
    title: 'Perpustakaan Daerah Hadirkan Layanan Baca Keliling Akhir Pekan di Alun-Alun Kecamatan',
    excerpt:
      'Koleksi buku bacaan anak, keterampilan usaha, dan sejarah lokal Cirebon dibawa langsung ke ruang publik warga.',
    category: 'Umum',
    author: 'Bagus Hidayat',
    authorRole: 'Kontributor Umum',
    date: '16 Nov 2026',
    readTime: '3 mnt baca',
    views: 1470,
    artworkVariant: 'archive',
    content: [
      'Dinas kearsipan dan perpustakaan meluncurkan armada baca keliling setiap Sabtu dan Minggu pagi untuk menjangkau keluarga yang beraktivitas di lapangan terbuka kecamatan.',
      'Selain peminjaman buku gratis, relawan komunitas literasi turut memandu sesi mendongeng dan lokakarya menulis ringkas bagi pelajar sekolah dasar.',
      'Antusiasme pengunjung terlihat dari peningkatan pendaftaran anggota perpustakaan daring sejak program akhir pekan ini dimulai.',
    ],
  },
  {
    id: 'art-18',
    title: 'Program Bank Sampah Terpadu di Permukiman Padat Ubah Limbah Organik Jadi Kompos Warga',
    excerpt:
      'Pengelolaan sampah berbasis rukun warga menekan volume kiriman ke tempat pembuangan akhir hingga 30 persen setiap bulan.',
    category: 'Umum',
    author: 'Dian Permana',
    authorRole: 'Koresponden Lapangan',
    date: '14 Nov 2026',
    readTime: '4 mnt baca',
    views: 1380,
    artworkVariant: 'cityscape',
    content: [
      'Pengurus lingkungan di beberapa kelurahan kota mulai mengoperasikan rumah kompos mini dan bank sampah terpilah yang dikelola secara swadaya oleh warga.',
      'Sampah dapur rumah tangga diolah menggunakan metode biopori dan maggot sehingga menghasilkan pupuk padat untuk taman lingkungan sekitar.',
      'Sementara itu, limbah kemasan plastik dan kertas bernilai ekonomis ditimbang rutin dan hasilnya dicatat sebagai tabungan kas sosial warga.',
    ],
  },
  {
    id: 'art-19',
    title: 'Peningkatan Drainase Kawasan Timur Cirebon Rampung Sebelum Puncak Musim Hujan',
    excerpt:
      'Normalisasi saluran penghubung dan pemasangan pintu air otomatis ditargetkan mengurangi genangan di ruas jalan utama antarkecamatan.',
    category: 'Daerah',
    author: 'Raka Pratama',
    authorRole: 'Redaktur Daerah',
    date: '17 Nov 2026',
    readTime: '4 mnt baca',
    views: 2110,
    artworkVariant: 'cityscape',
    content: [
      'Dinas pekerjaan umum menyelesaikan pengerukan sedimen sepanjang delapan kilometer saluran primer di wilayah timur Kabupaten Cirebon menjelang puncak curah hujan akhir tahun.',
      'Petugas lapangan juga memasang saringan sampah mekanis di sejumlah titik pertemuan aliran sungai guna mencegah penyumbatan saat debit air meningkat mendadak.',
      'Warga sekitar diimbau turut menjaga kebersihan selokan lingkungan agar aliran air menuju muara tetap lancar.',
    ],
  },
  {
    id: 'art-20',
    title: 'Revitalisasi Pasar Sandang Tegalgubug Siapkan Zona Parkir Teratur dan Jalur Bongkar Muat',
    excerpt:
      'Penataan sirkulasi kendaraan di pusat grosir tekstil terbesar wilayah timur Jawa Barat mulai diuji coba pada hari pasaran.',
    category: 'Daerah',
    author: 'Raka Pratama',
    authorRole: 'Redaktur Daerah',
    date: '15 Nov 2026',
    readTime: '4 mnt baca',
    views: 1940,
    artworkVariant: 'harbor',
    content: [
      'Pengelola Pasar Tegalgubug bersama dinas perhubungan menata ulang titik masuk kendaraan angkutan barang agar tidak menumpuk di badan jalan raya Pantura saat jam sibuk pagi.',
      'Area parkir terpisah disiapkan untuk bus rombongan pembeli luar daerah sehingga kenyamanan akses menuju los pedagang lebih terjaga.',
      'Paguyuban pedagang menyambut positif pemisahan jalur tersebut karena mempercepat proses distribusi barang ke kios.',
    ],
  },
  {
    id: 'art-21',
    title: 'Kerja Sama Pariwisata Budaya Ciayumajakuning Luncurkan Rute Kereta Wisata Akhir Pekan',
    excerpt:
      'Paket perjalanan terpadu menghubungkan sentra batik Trusmi, keraton bersejarah, hingga kawasan agrowisata lereng Ciremai.',
    category: 'Daerah',
    author: 'Dian Permana',
    authorRole: 'Koresponden Lapangan',
    date: '13 Nov 2026',
    readTime: '3 mnt baca',
    views: 1760,
    artworkVariant: 'capitol',
    content: [
      'Empat pemerintah daerah bersama operator transportasi meluncurkan jadwal terintegrasi yang memudahkan pelancong menjangkau destinasi budaya dan kuliner dalam satu hari perjalanan.',
      'Pemandu wisata bersertifikat disiagakan di stasiun kedatangan untuk memperkenalkan sejarah arsitektur keraton serta produk unggulan perajin setempat.',
      'Program promosi bersama ini diharapkan memperpanjang masa tinggal wisatawan di kawasan Cirebon Raya.',
    ],
  },
  {
    id: 'art-22',
    title: 'Forum Musyawarah Perencanaan Daerah Prioritaskan Beasiswa Vokasi dan Akses Air Bersih',
    excerpt:
      'Fraksi legislatif dan tim anggaran sepakat mengunci alokasi program dasar dalam rancangan APBD tahun anggaran mendatang.',
    category: 'Politik',
    author: 'Nadia Kusuma',
    authorRole: 'Jurnalis Politik',
    date: '16 Nov 2026',
    readTime: '4 mnt baca',
    views: 1690,
    artworkVariant: 'capitol',
    content: [
      'Rapat gabungan badan anggaran bersama kepala organisasi perangkat daerah menyepakati dua fokus utama belanja publik pada tahun mendatang, yaitu perluasan jaringan pipa air bersih dan beasiswa pelatihan kerja.',
      'Perwakilan warga yang hadir dalam forum konsultasi publik menekankan perlunya pemerataan sarana air minum bagi desa-desa di wilayah pesisir yang rawan kekeringan musiman.',
      'Seluruh draf rincian program akan dipublikasikan melalui portal keterbukaan informasi sebelum pengesahan paripurna.',
    ],
  },
  {
    id: 'art-23',
    title: 'Penyelenggara Pemilu Daerah Perkuat Pemutakhiran Data Pemilih Berbasis RT dan RW',
    excerpt:
      'Verifikasi faktual berkala dilakukan bersama perangkat kelurahan untuk memastikan akurasi daftar warga yang berpindah domisili.',
    category: 'Politik',
    author: 'Nadia Kusuma',
    authorRole: 'Jurnalis Politik',
    date: '14 Nov 2026',
    readTime: '4 mnt baca',
    views: 1580,
    artworkVariant: 'courthouse',
    content: [
      'Komisi penyelenggara pemilu tingkat kabupaten menggelar rapat koordinasi bersama dinas kependudukan guna memutakhirkan data pemilih berkelanjutan secara triwulanan.',
      'Warga dapat mengecek status pencatatan diri secara daring maupun melalui papan pengumuman balai desa setiap awal bulan.',
      'Langkah pemutakhiran dini ini dinilai penting untuk meminimalkan kendala administratif pada setiap tahapan agenda demokrasi mendatang.',
    ],
  },
  {
    id: 'art-24',
    title: 'Rancangan Peraturan Daerah Perlindungan Lahan Pertanian Pangan Berkelanjutan Masuki Uji Publik',
    excerpt:
      'Draf regulasi menetapkan zona sawah irigasi teknis yang tidak boleh dialihfungsikan guna menjaga ketahanan pangan daerah.',
    category: 'Politik',
    author: 'Asep Maulana',
    authorRole: 'Pemimpin Redaksi',
    date: '12 Nov 2026',
    readTime: '5 mnt baca',
    views: 1640,
    artworkVariant: 'capitol',
    content: [
      'Panitia khusus legislatif membuka ruang masukan bagi kelompok tani, akademisi, dan pelaku industri terhadap rancangan peraturan perlindungan lahan pertanian produktif.',
      'Dalam aturan tersebut, pemerintah daerah juga menyiapkan skema insentif pajak bumi dan bantuan sarana irigasi bagi petani yang mempertahankan fungsi sawah lestari.',
      'Uji publik dijadwalkan berlangsung di tiga wilayah pemilihan sebelum naskah final dibahas bersama gubernur.',
    ],
  },
  {
    id: 'art-25',
    title: 'Koperasi Petani Bawang dan Cabai Pantura Bangun Gudang Pendingin Mandiri di Sentra Panen',
    excerpt:
      'Fasilitas penyimpanan suhu terkendali membantu petani menahan penjualan saat panen raya agar harga jual tetap stabil.',
    category: 'Ekonomi',
    author: 'Siti Nurhaliza',
    authorRole: 'Redaktur Hukum & Ekonomi',
    date: '17 Nov 2026',
    readTime: '4 mnt baca',
    views: 2140,
    artworkVariant: 'archive',
    content: [
      'Gabungan kelompok tani hortikultura di perbatasan Cirebon dan Brebes mulai mengoperasikan gudang pendingin berkapasitas 80 ton yang dibiayai melalui skema kemitraan koperasi.',
      'Dengan daya simpan hingga dua bulan lebih lama, petani tidak lagi terpaksa melepas hasil panen dengan harga rendah saat pasokan pasar melimpah.',
      'Koperasi juga bermitra langsung dengan pasar induk regional untuk memangkas mata rantai distribusi.',
    ],
  },
  {
    id: 'art-26',
    title: 'Minat Wisata Belanja Akhir Pekan Dongkrak Tingkat Hunian Hotel dan Kuliner Cirebon',
    excerpt:
      'Pelaku perhotelan mencatat peningkatan okupansi kamar hingga 78 persen sepanjang bulan November seiring agenda festival budaya.',
    category: 'Ekonomi',
    author: 'Bagus Hidayat',
    authorRole: 'Kontributor Umum',
    date: '15 Nov 2026',
    readTime: '3 mnt baca',
    views: 1870,
    artworkVariant: 'cityscape',
    content: [
      'Asosiasi pengelola hotel dan restoran di Cirebon melaporkan tren positif kunjungan wisatawan domestik dari kawasan Jabodetabek dan Bandung setiap akhir pekan.',
      'Kemudahan akses jalan tol dan beragam agenda kuliner malam menjadi pendorong utama perputaran ekonomi sektor jasa serta suvenir lokal.',
      'Sejumlah hotel turut menggandeng perajin batik lokal untuk menghadirkan gerai kurasi produk UMKM di area lobi.',
    ],
  },
  {
    id: 'art-27',
    title: 'Kampus Teknik di Cirebon Kembangkan Sistem Peringatan Dini Banjir Rob Pesisir Berbasis Radar',
    excerpt:
      'Data ketinggian muka air laut dikirim otomatis setiap lima menit ke dasbor siaga bencana kelurahan pesisir.',
    category: 'Teknologi',
    author: 'Fajar Nugroho',
    authorRole: 'Redaktur Teknologi',
    date: '16 Nov 2026',
    readTime: '4 mnt baca',
    views: 2210,
    artworkVariant: 'harbor',
    content: [
      'Tim peneliti teknik informatika dan kelautan memasang tiga unit sensor radar ultrasonik di dermaga nelayan untuk memantau pasang surut air laut secara berkelanjutan.',
      'Informasi potensi banjir rob dikirimkan secara otomatis melalui pesan siaran ke perangkat ketua rukun warga dan pos penanggulangan bencana setempat.',
      'Perangkat lunak dasbor terbuka yang dikembangkan mahasiswa ini juga menyediakan riwayat data pasang surut untuk kajian tata ruang pesisir.',
    ],
  },
  {
    id: 'art-28',
    title: 'Adopsi Tanda Tangan Elektronik Tersertifikasi Pangkas Waktu Pengesahan Dokumen Perizinan Daerah',
    excerpt:
      'Pemohon izin usaha kini menerima dokumen resmi bersegel digital langsung melalui akun portal layanan tanpa perlu mengambil berkas fisik.',
    category: 'Teknologi',
    author: 'Fajar Nugroho',
    authorRole: 'Redaktur Teknologi',
    date: '14 Nov 2026',
    readTime: '3 mnt baca',
    views: 1990,
    artworkVariant: 'press',
    content: [
      'Dinas penanaman modal dan pelayanan terpadu satu pintu mulai menerapkan tanda tangan elektronik tersertifikasi untuk 35 jenis izin operasional usaha mikro dan menengah.',
      'Keabsahan setiap surat keputusan dapat diverifikasi instan oleh perbankan maupun mitra bisnis dengan memindai kode QR unik di bagian bawah dokumen.',
      'Transformasi ini memangkas waktu tunggu penerbitan surat dari rata-rata lima hari kerja menjadi kurang dari 24 jam.',
    ],
  },
];
