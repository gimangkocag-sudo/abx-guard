# ABX GUARD — Fase 1 (Core) + Fase 2 (User Experience) + Fase 3 (Admin)

Smart Antibiotic Stewardship & Microbiome Care. Stack: Laravel + Inertia.js + React + Tailwind (starter kit Laravel Breeze).

> **Status verifikasi:** kode ini ditulis tanpa PHP/Composer/npm, jadi **belum pernah dijalankan**. Migration, seeder, `php artisan test`, `npm run build`, dan aplikasi belum terverifikasi. Yang sudah dicek secara statis: kurung/kurawal PHP seimbang; seluruh file JS/JSX lolos parse sintaks (TypeScript compiler); semua import `@/…` menunjuk file yang ada; URL internal frontend, route, komponen Inertia, dan props backend↔frontend konsisten; tidak ada input pengguna di dalam SQL mentah (semua nilai di-bind). PHP belum bisa di-lint (tidak ada `php`), jadi jalankan `php artisan migrate --seed` dan `php artisan test` sebagai pengujian pertama. Jika ada error, kirim pesannya untuk diperbaiki.

ZIP ini adalah **overlay**: berisi file ABX Guard yang ditumpuk di atas skeleton Laravel + Breeze. Skeleton (`vendor`, `bootstrap`, `public`, dll.) sengaja tidak disertakan karena dibuat resmi oleh Composer.

## Instalasi

Prasyarat: PHP 8.2+, Composer, Node 18+, MySQL atau PostgreSQL.

```bash
# 1. Buat skeleton Laravel + Breeze (React/Inertia)
composer create-project laravel/laravel abx-guard
cd abx-guard
composer require laravel/breeze --dev
php artisan breeze:install react      # pilih opsi default; tanpa dark mode/SSR tidak masalah

# 2. Tumpuk file ABX Guard (jalankan dari folder abx-guard, ganti path sesuai lokasi ekstrak ZIP)
cp -R /path/ke/abx-guard-fase3/{app,config,database,resources,routes,tests} .
# menimpa: database/seeders/DatabaseSeeder.php dan resources/js/Pages/Dashboard.jsx (memang disengaja)

# 3. Daftarkan route ABX Guard
echo "require __DIR__.'/abx.php';" >> routes/web.php
```

Hapus juga route `/` bawaan Breeze di `routes/web.php` (yang me-render `Welcome`), karena halaman Home ABX Guard kini melayani `/`.

Lalu edit `routes/web.php`: ganti route `/dashboard` bawaan Breeze menjadi:

```php
Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');
```

```bash
# 4. Konfigurasi environment
cp .env.example .env                  # lewati jika .env sudah ada
php artisan key:generate              # lewati jika sudah dibuat create-project
# salin isi .env.abx.example ke .env, lalu isi DB_* dan ADMIN_PASSWORD

# 5. Database + data awal
php artisan migrate --seed

# 6. Jalankan
npm install
npm run dev                           # terminal 1
php artisan serve                     # terminal 2  -> http://127.0.0.1:8000
```

Seeder bersifat idempotent (`updateOrCreate`), aman dijalankan ulang: `php artisan db:seed`.

## Yang ada di Fase 1

| Area | Detail |
|---|---|
| Database | `surveys`, `survey_sections`, `survey_questions`, `survey_submissions`, `survey_answers`, `challenge_questions`, `challenge_attempts`, `challenge_answers`; kolom `users.role` |
| Survey | 36 item dari PDF (Knowledge 5, Attitude 5, Practice 6, Acceptance 20, dengan sub-kelompok), versi survey tersimpan di tiap submission |
| Aturan | satu submission per user (unique `user_id + survey_id`); jawaban disimpan relasional (satu baris per pertanyaan), dalam satu transaksi |
| Validasi | backend membangun aturan dari pertanyaan di database: semua item wajib, nilai harus sesuai skala |
| UI survey | stepper 5 layar (Knowledge → Attitude → Practice → Acceptance → Review) lalu Kirim; progres 20–100%; Lanjut/Kembali; jawaban tetap saat pindah langkah (state + sessionStorage); radio besar; ada label teks pada error |
| Auth | register/login/logout/reset password/profil dari Breeze |
| Role | `user` (default) dan `admin`; `role` tidak mass-assignable, jadi registrasi tidak bisa membuat admin |
| Otorisasi | middleware `EnsureUserIsAdmin` di route `/admin` (403 untuk non-admin); route survey hanya untuk user login; user hanya memproses datanya sendiri |
| Dashboard | user: sapaan, status KAP Survey, skor AMR Challenge terakhir; admin: total user, submission, completion, attempt challenge, 10 submission terbaru |

Akun admin dibuat dari `ADMIN_EMAIL` dan `ADMIN_PASSWORD`.
- Di environment **local/testing**, jika `ADMIN_PASSWORD` kosong, seeder memakai password development bawaan `ChangeMe-Dev-123!`.
- Di environment **lain (termasuk production/staging)**, `ADMIN_EMAIL` dan `ADMIN_PASSWORD` **wajib** diisi. Seeder berhenti dengan error (tanpa membuat admin) jika salah satunya kosong, atau jika email/password sama dengan default development (`admin@abxguard.test` / `ChangeMe-Dev-123!`). Di local/testing boleh dikosongkan (memakai default development).
- Nilai dibaca lewat `config('abx.admin.*')`, jadi tetap bekerja setelah `php artisan config:cache`.

## Fase 2 — User Experience & Education

**Memperbarui dari Fase 1:** salin ulang overlay (langkah 2), lalu jalankan `php artisan migrate` (ada 1 tabel baru) dan `npm run dev`. Tidak perlu seed ulang.

### Route baru
| URL | Nama | Akses | Keterangan |
|---|---|---|---|
| `/` | home | publik | Home |
| `/cek-keluhan` | symptom | publik | Symptom Check |
| `/smart-abx-alert` | alert | publik | Smart ABX Alert |
| `/belajar/{module}` | learn.show | publik | `bijak-antibiotik`, `amr`, `mikrobioma`, `pangan-fungsional`, `pharmacist-connect`, `myth-or-fact`; slug lain 404. Jika user login, kunjungan dicatat sebagai progres belajar |
| GET `/amr-challenge` | challenge.show | login | halaman challenge (pertanyaan tanpa kunci jawaban) |
| POST `/amr-challenge/periksa` | challenge.check | login | umpan balik per pertanyaan (JSON), throttle 60/menit |
| POST `/amr-challenge` | challenge.submit | login | submit jawaban; skor dihitung server, throttle 10/menit |
| GET `/amr-challenge/hasil/{attempt}` | challenge.result | login | hasil; policy: hanya pemilik attempt (403 selain itu) |
| GET `/dashboard` | dashboard | login | dashboard user diperbarui |

### Database
Database yang sama dengan Fase 1 (tidak ada database kedua). Migration baru `2026_10_02_000001_create_learning_progress_table`: tabel `learning_progress` (`user_id`, `module`, `last_visited_at`, unik per user+modul). AMR Challenge memakai tabel Fase 1 (`challenge_questions`, `challenge_attempts`, `challenge_answers`).

### Keputusan desain
- **AMR Challenge wajib login** karena attempt disimpan per user (`challenge_attempts.user_id` wajib). Tamu diarahkan ke login. Halaman edukasi dan Myth or Fact tetap publik.
- **Skor tidak pernah dipercaya dari klien.** Klien hanya mengirim pilihan (`mitos`/`fakta`) per pertanyaan; `ChallengeService::grade()` menghitung skor dari `correct_answer` di database dalam satu transaksi. Semua pertanyaan wajib dijawab (validasi dibangun dari database).
- **Myth or Fact** adalah permainan edukasi statis dari PDF, tidak menyimpan data. Skor tersimpan hanya di AMR Challenge.
- **Konten** ada di `resources/js/content/*.js` (sumber: PDF). Untuk keluhan yang di PDF hanya punya teks umum (nyeri tenggorokan, mual/muntah, nyeri perut, keluhan pencernaan lain), Symptom Check hanya menampilkan teks umum; tidak ada materi klinis tambahan.
- **Progress belajar** = jumlah dari 6 modul yang pernah dibuka user (`config/abx.php` → `modules`). Symptom Check dan Smart ABX Alert tidak dihitung.
- Tampilan hasil challenge selain 5/5 memakai teks netral (PDF hanya mendefinisikan pesan untuk 5/5 "Antibiotic Smart!").

### File utama Fase 2
- Backend: `app/Http/Controllers/{LearnController,ChallengeController}.php`, `app/Services/{ChallengeService,LearningProgressService}.php`, `app/Http/Requests/SubmitChallengeRequest.php`, `app/Policies/ChallengeAttemptPolicy.php`, `app/Models/LearningProgress.php`; diubah: `DashboardController`, `routes/abx.php`, `config/abx.php`.
- Frontend: `resources/js/Layouts/AbxLayout.jsx` (navigasi responsif); `resources/js/Components/Abx/*` (Button, Card, PageContainer, SectionHeader, EducationalCard, Accordion, RichBlocks, ProgressBar, QuizOption, QuizPlayer, CTASection, Disclaimer, ClosingBlock, FadeIn); `resources/js/Pages/Abx/*` dan `Pages/Dashboard.jsx`; `resources/js/content/*`.
- `Pages/Abx/Survey.jsx` (Fase 1) hanya diubah untuk memakai `AbxLayout` dan menampilkan judul; logika survey tidak berubah. Halaman admin Fase 1 tetap memakai layout Breeze (Fase 3).

### Belum ada / belum diverifikasi (Fase 2)
- Belum dijalankan di browser: tampilan responsif, fokus keyboard, dan kontras warna baru diperiksa dari kode, belum diuji di perangkat.
- Test otomatis baru ada dari Fase 3 (`tests/Feature/AdminPhase3Test.php`); belum ada test untuk penilaian challenge dan alur pengisian survey.
- Konsultasi apoteker real-time belum ada (UI hanya contoh dari PDF; input dinonaktifkan).
- Ilustrasi hero berupa SVG sederhana dan ikon berupa emoji; bisa diganti aset desain nanti.
- Admin (user, respons, statistik, chart, export) menunggu Fase 3.

## Fase 3 — Admin Dashboard, KAP Responses, Statistics & Export

**Memperbarui dari Fase 2:** salin ulang overlay (termasuk folder `tests`), lalu `npm run dev`. **Tidak ada migration baru** dan tidak ada tabel baru. Di production, isi `ADMIN_EMAIL` sebelum menjalankan seeder berikutnya.

### Route admin
Semua rute `/admin/*` berada di satu grup `auth` + `EnsureUserIsAdmin` (guest → login, user biasa → **403**). `KapFilterRequest` juga memeriksa role admin sebagai lapisan kedua.

| URL | Nama | Isi |
|---|---|---|
| `/admin` | admin.dashboard | kartu statistik, grafik submission 14 hari, distribusi skor challenge, submission per versi, submission terbaru |
| `/admin/users` | admin.users | daftar user (nama, email, role, tanggal daftar, status KAP versi default, jumlah attempt); cari, filter role, paginasi |
| `/admin/survey` | admin.survey.index | daftar submission; cari (nama/email/ID), filter versi, rentang tanggal, paginasi; tombol export |
| `/admin/survey/{submission}` | admin.survey.show | detail responden dan jawaban per bagian (Knowledge/Attitude/Practice/Acceptance) memakai wording dari database |
| `/admin/statistics` | admin.statistics | statistik + grafik per pertanyaan, filter versi dan tanggal |
| `/admin/export/kap` | admin.export.kap | unduh CSV sesuai filter |
| `/admin/challenge` | admin.challenge.index | ringkasan challenge (total, selesai, rata-rata, distribusi) dan daftar attempt |
| `/admin/challenge/{attempt}` | admin.challenge.show | detail attempt dan tinjauan jawaban |

Rute user `/amr-challenge/hasil/{attempt}` tetap hanya untuk pemilik attempt (policy); admin memakai rute admin di atas.

### Cara memakai dashboard admin
1. Login dengan akun admin (lihat "Akun admin"), lalu buka `/admin` (tautan "Buka Admin Dashboard" ada di Dashboard user).
2. **Users**: ketik nama/email dan/atau pilih role, lalu *Terapkan*. Password tidak pernah dimuat. Status KAP mengacu ke versi survey default (lihat "Versi aktif").
3. **KAP Survey**: pilih versi dan rentang tanggal untuk menyaring; klik ID untuk melihat detail jawaban.
4. **Statistik**: pilih versi survey dan (opsional) tanggal mulai/akhir. Halaman selalu untuk satu versi; ganti dropdown untuk melihat versi lain.
5. **Export CSV**: tombol ada di halaman KAP Survey dan Statistik dan membawa filter yang sedang dipilih.

### Statistik KAP
- Dihitung dengan **satu query `GROUP BY question_id, value`** di database (join ke `survey_submissions` untuk filter `survey_id` dan tanggal); PHP hanya menyusun hasil. Jumlah responden dihitung dengan `COUNT`. Daftar, users, dan detail memakai eager loading/subquery + paginasi (tanpa N+1).
- **Knowledge**: distribusi Benar/Salah/Tidak tahu per pertanyaan. Survei tidak mendefinisikan kunci jawaban, sehingga **tidak ada skor benar/salah**.
- **Attitude**: distribusi 1–5 dan rata-rata per item (grafik batang rata-rata).
- **Practice**: distribusi Tidak Pernah…Selalu per pertanyaan (tanpa rata-rata; item 1–4 dan 5–6 arahnya berlawanan sehingga rata-rata gabungan tidak bermakna).
- **Acceptance**: distribusi 1–5 dan rata-rata per item, dikelompokkan Ease of Use / Efficiency & Integration / User Confidence / Acceptance, plus grafik rata-rata per kelompok.
- Grafik dibuat dengan komponen React/CSS sendiri (`BarChart`, `DistributionBar`) tanpa dependency baru. Setiap grafik disertai angka dan persen dalam teks (tidak hanya warna) dan `aria-label`.
- Definisi dashboard: **Completion Rate** = jumlah user yang sudah mengisi survey versi default ÷ seluruh user; **Total KAP Submissions** = semua versi (rincian per versi ditampilkan terpisah).

### Export CSV
- Selalu untuk **satu** survey (kolom = kode pertanyaan versi itu: `K1…K5, A1…A5, P1…P6, C1…C20`). Jika tidak ada versi dipilih, dipakai versi default.
- Kolom tetap: `submission_id, user_name, user_email, survey_id, survey_version, submitted_at, status`, lalu satu kolom per pertanyaan berisi nilai tersimpan (`benar/salah/tidak_tahu` atau `1–5`). Tidak ada password atau data sensitif lain.
- Mengikuti filter (versi, tanggal, pencarian). Di-stream per 500 baris (`chunkById`) dengan BOM UTF-8 agar terbaca benar di Excel. Nama/email yang diawali `= + - @` diberi awalan `'` untuk mencegah CSV/formula injection.
- Hanya CSV; Excel (.xlsx) tidak ditambahkan agar tidak menambah dependency. CSV bisa dibuka langsung di Excel/Sheets.

### Versioning dan versi aktif
- Aturan Fase 1 dipertahankan: satu versi survey = satu baris `surveys`; `unique(user_id, survey_id)`. Semua query statistik/daftar/export memakai **`survey_id`**, bukan hanya `survey_version`, dan tidak pernah menggabungkan versi.
- **`SurveyService::activeSurvey()`** (survey yang diisi user) kini deterministik: di antara baris dengan slug KAP dan `is_active = true`, dipakai **versi tertinggi** (`ORDER BY version DESC`). Jika kelak ada beberapa versi aktif, versi lama tidak dipakai untuk pengisian baru; saat meluncurkan v2, sebaiknya set v1 `is_active = false`.
- **`SurveyService::reportingSurvey()`** (default laporan admin): versi aktif tertinggi; jika tidak ada yang aktif, versi terbaru. Statistik dan export tidak bergantung pada status "aktif" karena admin selalu memilih `survey_id` eksplisit di dropdown (nilai default hanya untuk pilihan awal).
- Batasan Fase 1 belum berubah: `surveys.slug` dan `survey_questions.code` masih unik global, sehingga membuat v2 tetap membutuhkan migration (lihat bagian versioning di bawah).

### Keamanan (Fase 3)
Query memakai Eloquent/query builder dengan binding; satu-satunya SQL mentah adalah fungsi agregat konstan (`COUNT`, `AVG`, `DATE`) tanpa input pengguna. Input filter divalidasi (`KapFilterRequest`: survey harus ada di tabel, tanggal valid, `to ≥ from`, `q` ≤ 100 karakter). Export, detail submission, dan detail attempt hanya dapat diakses admin (403 untuk lainnya), sehingga mengganti ID di URL tidak memberi data ke user biasa.

### File utama Fase 3
- Backend: `app/Http/Controllers/Admin/{Dashboard,User,SurveyResponse,Statistics,Export,Challenge}Controller.php`, `app/Services/{AdminDashboardService,KapStatisticsService,KapExportService}.php`, `app/Http/Requests/Admin/KapFilterRequest.php`, `app/Support/Pagination.php`; diubah: `SurveySubmission` (scope `filtered`), `SurveyService`, `AdminSeeder`, `routes/abx.php`.
- Frontend: `Layouts/AdminLayout.jsx` (sidebar + top bar responsif), `Components/Admin/*`, `Pages/Admin/*`.
- Test: `tests/Feature/AdminPhase3Test.php` (otorisasi semua rute admin, isolasi hasil challenge, filter dan isi export, pemisahan statistik antar-versi, aturan seeder admin). **Belum pernah dijalankan.**

### Belum diverifikasi / belum ada (Fase 3)
- Belum dijalankan di lingkungan nyata: migration, seeder, `php artisan test`, query statistik pada MySQL/PostgreSQL (`DATE()`, `AVG`, `NULLIF` dipilih agar portabel, tetapi belum diuji), export, dan tampilan/responsif/keyboard di browser.
- Belum ada tes untuk alur pengisian survey, penilaian challenge, dan pengujian volume besar export.
- Belum ada manajemen user (ubah role/hapus), edit pertanyaan survey dari admin, atau export Excel.
- Membuat KAP v2 masih memerlukan migration relaksasi constraint unik (lihat di bawah).

## Keputusan versioning survey

Saat ini hanya ada KAP Survey v1, sehingga skema tidak diubah. Aturan yang berlaku agar Fase 3 (statistik dan riwayat submission) konsisten:

1. **Satu versi survey = satu baris `surveys`** (`survey_id` sendiri, beserta section dan pertanyaannya). Kolom `surveys.version` menandai versi tersebut dan disalin ke `survey_submissions.survey_version` saat submit.
2. Constraint `unique(user_id, survey_id)` berarti **satu submission per user per versi**. Karena versi 2 memakai `survey_id` berbeda, user tetap bisa mengisi v2 dan riwayat v1 tetap utuh.
3. **Jangan mengedit teks, urutan, atau skala pertanyaan di tempat** setelah ada submission. Perubahan isi = versi baru. (Peringatan: menjalankan ulang `SurveySeeder` setelah mengubah teksnya akan menimpa pertanyaan v1 yang sudah dijawab.)
4. Statistik dan export **selalu dikelompokkan per `survey_id`/versi**; jangan menggabungkan jawaban lintas versi kecuali ada pemetaan pertanyaan yang eksplisit.

**Yang harus diubah saat v2 dibuat (belum dilakukan, sengaja ditunda):** constraint unik `surveys.slug` dan `survey_questions.code` saat ini global, sehingga v2 dengan slug/kode yang sama akan ditolak. Migration v2 perlu mengubahnya menjadi `unique(slug, version)` dan `unique(section_id, code)`, serta `SurveyService::activeSurvey()` dan seeder perlu memilih versi aktif tertinggi.

## Cakupan fase

Fase 1 (core), Fase 2 (user experience), dan Fase 3 (admin) sudah dikerjakan. Tidak ada fase lanjutan yang direncanakan dalam paket ini; daftar yang belum ada per fase ada pada bagian "Belum diverifikasi / belum ada" masing-masing.

## Deployment (ringkas)

- **Railway:** buat service dari repo, tambahkan database MySQL/PostgreSQL, isi variabel env (`APP_KEY` dari `php artisan key:generate --show`, `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, `DB_*`, `ADMIN_*`). Build: `composer install --no-dev --optimize-autoloader && npm ci && npm run build`. Release: `php artisan migrate --force && php artisan db:seed --force`.
- **VPS (Nginx + PHP-FPM):** arahkan document root ke `public/`, jalankan perintah build di atas, `php artisan config:cache route:cache`, pastikan `storage/` dan `bootstrap/cache/` writable oleh user web server, aktifkan HTTPS.
- Jangan pernah commit `.env`. Ganti kredensial admin sebelum `db:seed` di production.
