<?php

namespace Database\Seeders;

use App\Models\ChallengeQuestion;
use Illuminate\Database\Seeder;

class ChallengeSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['Antibiotik dapat digunakan untuk mengobati flu biasa.', 'mitos', 'Flu biasa umumnya disebabkan oleh virus. Antibiotik bekerja terhadap bakteri sehingga tidak digunakan untuk mengobati infeksi virus.'],
            ['Antibiotik sisa boleh digunakan kembali ketika mengalami gejala yang sama.', 'mitos', 'Gejala yang sama tidak selalu berarti penyebab penyakitnya sama. Antibiotik sisa juga belum tentu sesuai dengan kondisi saat ini.'],
            ['Menggunakan antibiotik tanpa konsultasi dapat meningkatkan risiko penggunaan yang tidak tepat.', 'fakta', 'Penggunaan antibiotik tanpa penilaian yang sesuai dapat menyebabkan antibiotik digunakan ketika tidak diperlukan atau tidak sesuai dengan kondisi yang ditangani.'],
            ['Antibiotik harus digunakan sesuai instruksi tenaga kesehatan.', 'fakta', 'Penggunaan antibiotik perlu mengikuti instruksi mengenai dosis, frekuensi, dan lama penggunaan yang diberikan oleh tenaga kesehatan.'],
            ['Probiotik dapat menggantikan antibiotik untuk mengobati infeksi bakteri.', 'mitos', 'Probiotik bukan pengganti antibiotik. Probiotik dan antibiotik memiliki tujuan penggunaan yang berbeda.'],
        ];
        foreach ($items as $i => [$statement, $answer, $explanation]) {
            ChallengeQuestion::updateOrCreate(['sort' => $i + 1], compact('statement', 'explanation') + ['correct_answer' => $answer]);
        }
    }
}
