<?php

namespace Database\Seeders;

use App\Models\Survey;
use Illuminate\Database\Seeder;

class SurveySeeder extends Seeder
{
    public function run(): void
    {
        $survey = Survey::updateOrCreate(['slug' => config('abx.survey_slug')], [
            'title' => 'Kenali Pemahamanmu tentang Antibiotik',
            'description' => 'Survei singkat ini bertujuan mengetahui pengetahuan, sikap, praktik, dan penerimaan pengguna terhadap edukasi mengenai antibiotik, AMR, dan mikrobioma.',
            'version' => 1,
            'is_active' => true,
        ]);

        $sections = [
            ['key' => 'knowledge', 'title' => 'Knowledge', 'instruction' => 'Pilih jawaban yang paling sesuai.', 'scale' => 'knowledge', 'prefix' => 'K', 'items' => [
                'Antibiotik digunakan untuk mengobati infeksi bakteri.',
                'Semua batuk membutuhkan antibiotik.',
                'Penggunaan antibiotik yang tidak tepat dapat berkontribusi terhadap resistensi antibiotik.',
                'Antibiotik dapat memengaruhi mikrobiota usus.',
                'Antibiotik sisa sebaiknya tidak digunakan kembali tanpa konsultasi tenaga kesehatan.',
            ]],
            ['key' => 'attitude', 'title' => 'Attitude', 'instruction' => 'Berikan penilaian dari Sangat Tidak Setuju sampai Sangat Setuju.', 'scale' => 'agreement', 'prefix' => 'A', 'items' => [
                'Saya merasa penting menggunakan antibiotik secara rasional.',
                'Saya bersedia berkonsultasi dengan tenaga kesehatan sebelum menggunakan antibiotik.',
                'Saya merasa penting ikut mencegah resistensi antibiotik.',
                'Saya tertarik mempelajari kesehatan mikrobioma.',
                'Saya merasa edukasi mengenai AMR penting bagi masyarakat.',
            ]],
            ['key' => 'practice', 'title' => 'Practice', 'instruction' => 'Seberapa sering kamu melakukan hal berikut?', 'scale' => 'frequency', 'prefix' => 'P', 'items' => [
                'Saya membeli antibiotik tanpa berkonsultasi dengan tenaga kesehatan.',
                'Saya menggunakan antibiotik sisa dari pengobatan sebelumnya.',
                'Saya menggunakan antibiotik milik orang lain.',
                'Saya memberikan antibiotik saya kepada orang lain.',
                'Saya mengikuti instruksi penggunaan antibiotik dari tenaga kesehatan.',
                'Saya bertanya kepada apoteker ketika tidak memahami cara penggunaan obat.',
            ]],
            ['key' => 'acceptance', 'title' => 'Acceptance', 'instruction' => 'Bagaimana pendapatmu mengenai ABX Guard?', 'scale' => 'agreement', 'prefix' => 'C', 'items' => [
                ['Ease of Use', 'ABX Guard mudah digunakan.'],
                ['Ease of Use', 'Menu dan fitur ABX Guard mudah dipahami.'],
                ['Ease of Use', 'Saya mudah menemukan informasi yang saya butuhkan.'],
                ['Ease of Use', 'Tampilan ABX Guard nyaman digunakan.'],
                ['Efficiency & Integration', 'ABX Guard membantu saya mendapatkan informasi mengenai antibiotik dengan cepat.'],
                ['Efficiency & Integration', 'Fitur-fitur ABX Guard saling melengkapi.'],
                ['Efficiency & Integration', 'Symptom Check membantu saya menemukan materi edukasi yang sesuai.'],
                ['Efficiency & Integration', 'Smart ABX Alert membantu saya berhenti sejenak sebelum menggunakan antibiotik.'],
                ['Efficiency & Integration', 'Informasi antibiotik, AMR, dan mikrobioma dalam ABX Guard saling berkaitan dan mudah dipahami.'],
                ['User Confidence', 'Saya merasa lebih percaya diri dalam memahami penggunaan antibiotik setelah menggunakan ABX Guard.'],
                ['User Confidence', 'Saya merasa lebih memahami risiko penggunaan antibiotik yang tidak tepat.'],
                ['User Confidence', 'Saya merasa lebih memahami resistensi antimikroba.'],
                ['User Confidence', 'Saya merasa lebih memahami hubungan antibiotik dengan mikrobioma.'],
                ['User Confidence', 'Saya merasa lebih yakin untuk berkonsultasi dengan tenaga kesehatan ketika memiliki pertanyaan mengenai antibiotik.'],
                ['Acceptance', 'Saya tertarik menggunakan ABX Guard kembali.'],
                ['Acceptance', 'Saya bersedia merekomendasikan ABX Guard sebagai media edukasi kepada orang lain.'],
                ['Acceptance', 'Saya tertarik menggunakan fitur konsultasi apoteker.'],
                ['Acceptance', 'Saya tertarik mempelajari informasi mengenai mikrobioma melalui ABX Guard.'],
                ['Acceptance', 'Saya tertarik mempelajari pangan fungsional, probiotik, prebiotik, sinbiotik, dan postbiotik.'],
                ['Acceptance', 'Secara keseluruhan, ABX Guard merupakan media edukasi yang menarik bagi saya.'],
            ]],
        ];

        foreach ($sections as $i => $s) {
            $section = $survey->sections()->updateOrCreate(['key' => $s['key']], [
                'title' => $s['title'], 'instruction' => $s['instruction'], 'scale' => $s['scale'], 'sort' => $i + 1,
            ]);
            foreach ($s['items'] as $n => $item) {
                [$group, $text] = is_array($item) ? $item : [null, $item];
                $section->questions()->updateOrCreate(['code' => $s['prefix'].($n + 1)], [
                    'group' => $group, 'text' => $text, 'sort' => $n + 1,
                ]);
            }
        }
    }
}
