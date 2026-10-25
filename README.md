# Tracer Study Alumni — PP Riyadhul Amien

Sistem web untuk menelusuri kiprah alumni **Madrasah Aliyah Pondok Pesantren Riyadhul Amien** setelah lulus: khidmah/pengabdian, kuliah, bekerja, atau wirausaha. Alumni mengisi kuesioner tracer study secara berkala dan memperbarui biodatanya. Pengelola madrasah mendapat data yang rapi beserta analitik siap pakai untuk **akreditasi, evaluasi kurikulum, dan menjaga silaturahmi alumni**.

## Fitur

| Modul | Isi |
|---|---|
| **Akun & Autentikasi** | Login dengan NISN atau email, onboarding wajib di login pertama (WhatsApp + persetujuan penggunaan data), pendaftaran mandiri dengan verifikasi admin, reset password oleh admin, kelola akun admin |
| **Data Alumni** | Daftar alumni dengan pencarian & filter, tambah/ubah/nonaktifkan, import Excel dengan pratinjau dan validasi per baris, ekspor Excel, profil & foto alumni |
| **Kuesioner** | Builder per bagian dengan 8 tipe pertanyaan, logika kondisional, `metric_key` untuk analitik, duplikasi & pratinjau; pengisian bertahap (stepper) dengan simpan draf otomatis dan revisi selama periode buka |
| **Analitik & Laporan** | Ringkasan dashboard, response rate per angkatan, distribusi status kegiatan, masa tunggu, rentang pendapatan, rekap per pertanyaan, ekspor jawaban ke Excel dan laporan ke PDF |
| **Berita & Agenda** | Berita, agenda, pengumuman, dan info beasiswa dengan editor teks kaya, jadwal terbit, dan halaman publik |
| **Pesan Pribadi** | Chat 1-ke-1 real-time (Laravel Reverb), kotak masuk, tanda sudah dibaca, pencarian kontak, blokir pengguna, pengaturan privasi |
| **Notifikasi** | Lonceng dalam aplikasi, tautan WhatsApp siap kirim, pengingat kuesioner otomatis setiap hari |

## Teknologi

- **Backend:** PHP 8.4, Laravel 13, Inertia.js v2, Laravel Reverb, Sanctum
- **Frontend:** React 18, Tailwind CSS 3, Vite, Recharts, Tiptap, dnd-kit
- **Pendukung:** OpenSpout (Excel), DomPDF (PDF), HTML Purifier, Intervention Image
- **Basis data:** MySQL (produksi/lokal) atau SQLite; tes memakai SQLite in-memory

## Persyaratan

- PHP 8.4 dengan ekstensi `pdo_mysql` (atau `pdo_sqlite`), `gd`, `zip`, `mbstring`
- Composer 2
- Node.js 20 ke atas dan npm
- MySQL 8 (opsional bila memakai SQLite)

## Instalasi Lokal

```bash
git clone https://github.com/regialhabib/tracer-study.git
cd tracer-study

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Atur koneksi basis data di `.env`. Bawaannya SQLite; untuk MySQL:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tracer-study
DB_USERNAME=root
DB_PASSWORD=
```

Lalu siapkan basis data, data contoh, dan tautan penyimpanan:

```bash
php artisan migrate --seed
php artisan storage:link
```

### Pesan real-time (opsional)

Tanpa konfigurasi tambahan, pesan tetap tersimpan tetapi baru muncul setelah halaman dimuat ulang. Untuk pengiriman real-time, tambahkan konfigurasi Reverb ke `.env` (isi ID, key, dan secret dengan string acak):

```dotenv
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=123456
REVERB_APP_KEY=ganti-dengan-key-acak
REVERB_APP_SECRET=ganti-dengan-secret-acak
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

## Menjalankan Aplikasi

```bash
composer run dev
```

Perintah ini menjalankan server aplikasi, Vite, Reverb, queue worker, dan scheduler sekaligus. Buka **http://localhost:8000**.

### Akun contoh (dari seeder)

| Peran | Login | Password |
|---|---|---|
| Admin | `admin@pesantren.sch.id` | `password` |
| Alumni | NISN `0051234501` s.d. `0051234508` | `password` |

> Ganti atau hapus akun contoh sebelum dipakai di lingkungan produksi.

## Tes & Format Kode

```bash
php artisan test --compact        # seluruh tes PHPUnit
vendor/bin/pint --dirty           # format kode PHP yang berubah
npm run build                     # build aset produksi
```

## Penjadwalan

`kuesioner:kirim-pengingat` berjalan setiap hari pukul 07.00 (WIB) untuk mengirim pengingat H-7 kepada alumni yang belum mengisi kuesioner aktif. Di server produksi, daftarkan scheduler Laravel di cron:

```cron
* * * * * cd /path/ke/tracer-study && php artisan schedule:run >> /dev/null 2>&1
```

Jalankan juga queue worker (`php artisan queue:work`) dan, bila memakai pesan real-time, `php artisan reverb:start`.

## Struktur Proyek

```
app/
├── Enums/              Status akun, status kegiatan, tipe pertanyaan, dll.
├── Http/Controllers/   Controller tipis per area (Admin, Alumni, Auth, Pesan)
├── Http/Requests/      Validasi (Form Request)
├── Services/           Logika bisnis per area (Admin, Alumni, Kuesioner, Pesan, ...)
└── Models/             Model Eloquent (nama domain berbahasa Indonesia)
resources/js/
├── Pages/              Halaman Inertia per area
├── Components/ui/      Komponen dasar design system
└── Layouts/            AdminLayout, AlumniLayout, PublicLayout, GuestLayout
routes/
├── web.php             Rute utama dan publik
├── admin.php, admin/   Rute panel admin per modul
└── alumni/, pesan.php  Rute alumni dan pesan
```

Alur kode: **controller → Form Request → Service**, dengan otorisasi di middleware peran dan Form Request.

## Kredit

Foto contoh di `public/images` berasal dari [Unsplash](https://unsplash.com) di bawah Unsplash License. Rincian per foto ada di [`public/images/CREDITS.md`](public/images/CREDITS.md).
