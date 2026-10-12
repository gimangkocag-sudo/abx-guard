# Akses staf laporan penelitian

Submission dan jawaban disimpan di tabel `research_submissions` dan `research_answers`, lalu ditampilkan pada `/admin/research-survey` beserta detail dan ekspor CSV.

Akses laporan penelitian terpisah dari `users.role` dan dari izin inbox Pharmacist Connect. Admin tetap dapat melihat laporan. Pengguna dengan keanggotaan aktif `research_staff_memberships` hanya dapat membuka daftar, detail, dan ekspor laporan penelitian; mereka tidak mendapat akses ke `/admin`, manajemen pengguna, statistik KAP historis, atau fitur admin lain.

Keanggotaan tidak dibuat otomatis. Operator yang berwenang dapat memberikan atau mencabut akses berdasarkan email akun yang sudah terdaftar:

```sh
php artisan research:staff staff@example.org
php artisan research:staff staff@example.org --revoke
```

Perintah ini tidak mengubah role global pengguna dan tidak menghapus submission atau jawaban. Migration `create_research_staff_memberships_table` hanya menambah tabel keanggotaan.
