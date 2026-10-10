# Catatan Review Instrumen Kuesioner ABx

**Status produk:** instrumen dari DOCX adalah survei aktif tunggal. KAP 36 item sudah dipensiunkan dari pengisian pengguna; data historis tetap tersedia terpisah untuk admin.

Dokumen sumber dibaca dari `C:\Users\TSC-AKA\Downloads\Kuesioner ABx.docx`. File belum tersimpan di `docs/`. Catatan ini memisahkan isi sumber dari asumsi implementasi; keputusan ilmiah berikut tetap memerlukan persetujuan pemilik instrumen/peneliti.

## Hal yang perlu dikonfirmasi

1. **Platform media sosial:** ringkasan perubahan menyebut TikTok, Instagram Reels, YouTube Short, dan Discord; item Bagian A justru menawarkan Instagram, TikTok, YouTube, WhatsApp/Telegram, dan X/Discord. Implementasi mengikuti pilihan pada item A di badan dokumen. Jangan mengganti pilihan tanpa konfirmasi.
2. **Nama produk:** DOCX memakai ABX Guard dan ABX Wise untuk platform/Instagram. Website tetap bernama ABX Guard; hubungan atau nama kanal ABX Wise perlu dipastikan.
3. **Kunci D1:** DOCX tidak memberi kunci jawaban. Respons Benar/Salah/Tidak Tahu disimpan per item; tidak ada skor pengetahuan otomatis.
4. **SUS:** DOCX meminta 10 skala 1–5 dan menyebut SUS, tetapi kesesuaian terjemahan/adaptasi serta pemetaan finalnya belum dikonfirmasi. Jawaban mentah tersedia; skor SUS belum dihitung.
5. **Tahap pengukuran:** petunjuk F dan label SUS menunjukkan evaluasi setelah pemaparan/mencoba platform. A–E dipetakan sebagai tahap awal dan F–H sebagai tahap evaluasi tanpa menduplikasi A–E. Peneliti perlu memastikan apakah A–E hanya awal atau perlu diulang sesuai protokol.
6. **Identitas, persetujuan, kerahasiaan:** A01 meminta nama/inisial sehingga pengumpulan tidak anonim. Perlu keputusan tentang persetujuan responden/wali, batas usia, siapa yang dapat melihat identitas, masa retensi, penghapusan, dan penggunaan kontak/login yang ada. UI tidak menyebut anonim.
7. **Skoring lain:** tidak ada algoritme atau kunci skor eksplisit untuk C, D2, E, atau F; aplikasi menyimpan respons mentah dan distribusi deskriptif. Jangan membuat indeks gabungan, kategori, atau klaim validasi tanpa protokol.

## Ambiguitas operasional yang tercatat

* A05 menggabungkan X/Discord dan tidak menawarkan Reels/Short sebagai opsi mandiri; implementasi menjaga opsi sumber apa adanya dan membatasi dua pilihan di server.
* B02 mencampur sumber informasi dengan “Tidak tahu / Tidak pernah”. Implementasi membuatnya eksklusif terhadap opsi sumber lain sesuai makna logis yang diminta, tetapi maksud peneliti perlu dikonfirmasi.
* E01 menggabungkan “Lupa / Tidak pernah”. Untuk E02 (“cara mendapatkan antibiotik tersebut terakhir kali”), responden dapat menandai tidak berlaku jika belum pernah menggunakan antibiotik; status itu disimpan terpisah dari jawaban yang terlewat. Pilihan “Lupa” membuat status ini tidak selalu dapat disimpulkan dari E01 saja.
* E06 menanyakan tindakan jika memiliki sisa antibiotik tetapi tidak menyediakan pilihan “tidak pernah memiliki sisa”. Jawaban kosong dibedakan dari “tidak berlaku”; peneliti perlu menentukan apakah item bersyarat.
* DOCX menomori SUS sebagai “Bagian 4” dan feedback sebagai “Bagian 5”. Tampilan web menormalisasikannya menjadi G dan H tanpa mengubah item.
* Akses F–H memerlukan konfirmasi responden bahwa ia telah mendapat pemaparan/mencoba platform; timestamp disimpan. Ini hanya gerbang proses dan bukan verifikasi paparan/intervensi.
* Label HBM untuk D2 berasal dari sumber; implementasi tidak menyatakan skala ini tervalidasi.
* Feedback H opsional dan jawaban kosong tetap dapat dibedakan dari teks yang dijawab. Tidak ada analisis tematik otomatis.

## Batasan privasi

Formulir memberi tahu bahwa nama/inisial diminta, jawaban digunakan dalam konteks penelitian, dan submission dikaitkan dengan akun yang login. Ini bukan survei anonim. Penerapan consent formal, pseudonimisasi analitik, retensi/penghapusan, serta pembatasan akses identitas di panel admin tetap membutuhkan kebijakan dan persetujuan pemilik penelitian.
