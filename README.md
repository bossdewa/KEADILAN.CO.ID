Berikut panduan lengkap instalasi file CSS, JavaScript, dan HTML tema KEADILAN.CO.ID di Blogspot, beserta alternatif copy-paste melalui fitur Edit HTML (panduan interaktif & tombol salin snippet siap-tempel juga sudah ditambahkan di tab Tema Blogger (4 File)).
1. Panduan Instalasi File CSS, JavaScript, dan HTML pada Blogspot
Blogger/Blogspot tidak menyediakan folder penyimpanan lokal untuk mengunggah file .css, .js, dan .html secara terpisah. Untuk menggunakan ke-3 file tersebut secara modular, gunakan alur berikut:
Langkah 1 — Siapkan Hosting/CDN untuk keadilan-theme.css dan keadilan-theme.js
Unduh file keadilan-theme.css, keadilan-theme.js, dan keadilan-theme-structure.html dari tab Tema Blogger (4 File).
Buat repositori publik baru di GitHub (misalnya keadilan-blogger-theme), lalu unggah keadilan-theme.css dan keadilan-theme.js ke repositori tersebut.
Anda akan mendapatkan tautan CDN gratis via jsDelivr dengan format:
CSS: https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/keadilan-theme.css
JS: https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/keadilan-theme.js
Langkah 2 — Pasang Tautan CSS dan Font di <head>
Masuk ke dasbor Blogger → Tema → klik ikon panah di samping Sesuaikan → Edit HTML.
Tekan Ctrl+F dan cari tag </head>.
Tempel kode berikut tepat di atas </head> (wajib memakai penutup /> agar lolos parser XML Blogger):
