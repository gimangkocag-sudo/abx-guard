# Pemetaan Implementasi Kuesioner Penelitian ABX Guard

## Sumber dan batas audit

Sumber utama: `C:\Users\TSC-AKA\Downloads\Kuesioner ABx.docx` (file DOCX yang dilampirkan pada permintaan). Salinan tersebut belum ada di repository. Instrumen KAP lama diverifikasi dari `database/seeders/SurveySeeder.php`, model survey lama, migrasi 2026-10-01, route `/kap-survey`, halaman `resources/js/Pages/Abx/Survey.jsx`, dan `tests/Feature/SurveyFlowTest.php`.

Instrumen resmi dan satu-satunya survei aktif adalah kuesioner DOCX, tersedia kepada pengguna di `/survei-penelitian`. KAP lama (Knowledge 5, Attitude 5, Practice 6, Acceptance 20; total 36) telah dipensiunkan dari pengisian pengguna. Schema, katalog, dan respons lamanya tetap disimpan sebagai histori terpisah. URL lama `/kap-survey` dan `/survey` mengarah ke survei resmi baru; POST KAP lama tidak lagi tersedia.

## Pemetaan item sumber

| Bagian tampilan | Kode stabil | Isi dari DOCX | Jenis data |
|---|---|---|---|
| A. Demografi & perilaku media sosial | A01–A07 | Nama/inisial; usia; jenis kelamin; kelas/tingkat; maksimal dua platform; durasi; pengalaman melihat/berinteraksi dengan konten | Teks; angka; pilihan tunggal; pilihan jamak |
| B. Paparan informasi antibiotik dan AMR | B01–B02 | Frekuensi melihat informasi; sumber informasi (jamak, termasuk Tidak tahu/Tidak pernah) | Pilihan tunggal; pilihan jamak eksklusif |
| C. Digital Health Literacy (adaptasi I-HEALS) | C01–C05 | Lima pernyataan mencari, menemukan, menggunakan, menilai, dan mempercayai informasi kesehatan digital | Likert 1–5 |
| D1. Pengetahuan antibiotik, AMR, mikrobioma | D101–D106 | Enam pernyataan antibiotik, virus, AMR, penggunaan tidak tepat, bakteri usus, dan pangan fermentasi/probiotik | Benar/Salah/Tidak Tahu; tanpa skor kebenaran |
| D2. Persepsi dan sikap | D201–D204 | Empat pernyataan risiko AMR, resep/rekomendasi, konsultasi tenaga kesehatan, dan mikrobioma | Likert 1–5 |
| E. Praktik dan swamedikasi | E01–E06 | Waktu terakhir; cara memperoleh; menghentikan dini; meminta antibiotik; membeli langsung; tindakan atas sisa | Pilihan tunggal |
| F. Evaluasi platform setelah pemaparan | F01–F04 | Smart ABX Alert; Microbiome Care; Pharmacist Connect; daya tarik/kemudahan | Likert 1–5; tahap evaluasi |
| G. SUS (dinormalisasi dari “Bagian 4”) | G01–G10 | Sepuluh pernyataan usability sesuai redaksi dokumen | Likert 1–5; jawaban mentah |
| H. Feedback kualitatif (dinormalisasi dari “Bagian 5”) | H01–H03 | Smart ABX Alert/Symptom Check; Microbiome Care/Functional Food; Pharmacist Connect/edukasi digital | Teks panjang; opsional |

Jumlah 47 item respons: 7 + 2 + 5 + 6 + 4 + 6 + 4 + 10 + 3. Item A05 maksimum dua pilihan divalidasi browser dan server. B02 menganggap opsi “Tidak tahu / Tidak pernah” eksklusif. Semua jawaban tersimpan sebagai nilai mentah bertipe; jawaban jamak berbentuk JSON. Item yang tidak dijawab dan item yang ditandai tidak berlaku disimpan dengan status berbeda.

## Pemetaan implementasi dan pelaporan

| Kode item | UI aktif | Penyimpanan | Validasi | Statistik dan ekspor |
|---|---|---|---|---|
| A01–A07 | `Research/Survey.jsx`, langkah Bagian A | `research_answers` → `research_items`, submission tahap `initial` | `ResearchSurveyRequest`: teks, usia angka, pilihan tunggal; A05 maksimum 2 dan hanya dari opsi katalog | Distribusi nilai mentah; CSV per kode item beserta status |
| B01–B02 | langkah Bagian B | Baris jawaban individual pada `research_answers` | Pilihan tunggal/jamak; B02 menolak “Tidak tahu/Tidak pernah” bersama sumber lain | Distribusi per opsi; tanpa skor |
| C01–C05 | langkah Bagian C | Jawaban individual bertipe `likert` | Hanya nilai 1–5 sesuai opsi | Distribusi 1–5; tanpa klaim validasi psikometrik |
| D101–D106 | langkah D1 | Jawaban individual bertipe `true_false_unknown` | Hanya Benar/Salah/Tidak Tahu | Distribusi mentah; tidak menghitung skor pengetahuan |
| D201–D204 | langkah D2 | Jawaban individual bertipe `likert` | Nilai 1–5 | Distribusi deskriptif; tanpa klaim skala HBM tervalidasi |
| E01–E06 | langkah Bagian E | Jawaban mentah; status `not_applicable` tersimpan terpisah | Pilihan sesuai katalog; E02/E06 dapat ditandai tidak berlaku | Distribusi jawaban dan status; tidak pernah menggunakan antibiotik tidak otomatis dianggap salah |
| F01–F04 | langkah Bagian F, tahap `evaluation` | Submission evaluation terpisah berdasarkan responden/instrumen/versi/tahap | Likert 1–5; tersedia setelah submission awal dan konfirmasi pemaparan | Distribusi deskriptif; tanpa kesimpulan kausal |
| G01–G10 | langkah Bagian G, tahap `evaluation` | Jawaban SUS mentah per item | Skala 1–5 | Distribusi dan ekspor mentah; skor menunggu konfirmasi redaksi |
| H01–H03 | langkah Bagian H, tahap `evaluation` | Teks tiap item tersimpan terpisah | Teks panjang opsional; kosong berbeda dari jawaban | Ringkasan menghitung status saja; detail dan CSV memuat respons mentah |

Semua item berada dalam `ResearchInstrument` → `ResearchSection` → `ResearchItem`; jawaban terhubung melalui `ResearchSubmission` dan `ResearchAnswer`. Controller pengguna menyajikan versi aktif dan service menyimpan jawaban dalam transaksi. `ResearchSurveyRequest` memvalidasi tipe dan opsi. Admin melihat detail/distribusi di `/admin/research-survey`; `ResearchExportService` mengekspor jawaban mentah dan status dengan escaping formula.

## Tahap pengukuran implementasi

* `initial`: A–E, hanya disimpan sekali per pengguna/instrumen/versi/tahap.
* `evaluation`: F–H setelah submission initial dan konfirmasi responden bahwa ia telah mendapat pemaparan/mencoba platform. Konfirmasi dan waktunya dicatat; sistem tidak memverifikasi paparan. Tahap ini tidak mengulang A–E dan tidak menyimpulkan bahwa desain pre/post tervalidasi.
* Draft tiap tahap tersimpan permanen; jawaban tersimpan per item dan transaksi. Mengirim tahap membuat status submitted dan mencegah submission duplikat.

## Relasi dengan KAP lama

KAP lama memiliki 36 item dan skala Knowledge/Agreement/Frequency untuk satu submission. Instrumen resmi ini memiliki 47 item, data demografi/paparan, jawaban teks dan jamak, D1 tanpa kunci, serta dua tahap. Tabel dan jawaban lama tidak dikonversi atau disalin. Statistik serta ekspor KAP yang masih ada hanya dapat dicapai melalui area admin berlabel histori; dashboard dan status pengguna menggunakan instrumen resmi baru.

## Rencana implementasi yang dijalankan

1. Buat catatan keputusan metodologis yang belum diketahui.
2. Tambahkan katalog item, versi, tahap, submission, dan jawaban melalui migrasi aditif serta seeder idempotent.
3. Tambahkan validasi request, service transaksi, draft/resume, submission awal/evaluasi, dan proteksi login yang konsisten dengan aplikasi.
4. Jadikan wizard responsif sebagai survei aktif; alihkan URL KAP lama ke instrumen resmi dan keluarkan dari navigasi pengguna.
5. Integrasikan dashboard admin, daftar pengguna, ringkasan, detail, distribusi item, filter tahap/tanggal, dan CSV aman dengan instrumen resmi. KAP lama diberi label histori.
6. Pusatkan token biru pada Tailwind/CSS, pertahankan warna status semantik.
7. Tambahkan tes fitur; jalankan tes, build, dan `git diff --check`. Migrasi hanya diuji melalui database sementara milik test suite, bukan database lokal yang berisi data.
