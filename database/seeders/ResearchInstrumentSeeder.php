<?php

namespace Database\Seeders;

use App\Models\ResearchInstrument;
use Illuminate\Database\Seeder;

class ResearchInstrumentSeeder extends Seeder
{
    public function run(): void
    {
        $instrument = ResearchInstrument::updateOrCreate(['key' => 'abx-guard-research', 'version' => 1], [
            'title' => 'Survei Penelitian ABX Guard: Paparan Informasi, Digital Health Literacy, Pengetahuan AMR, Persepsi, Praktik, dan Evaluasi Platform',
            'description' => 'Jawaban dikumpulkan untuk penelitian dan tersimpan bersama akun yang digunakan untuk masuk. Survei ini tidak anonim karena meminta nama/inisial. Akses jawaban dibatasi pada admin platform yang berwenang.',
            'is_active' => true,
        ]);

        $choice = fn (array $pairs) => array_map(fn ($value, $label) => ['value' => $value, 'label' => $label], array_keys($pairs), array_values($pairs));
        $likert = $choice(['1' => 'Sangat Tidak Setuju', '2' => 'Tidak Setuju', '3' => 'Netral', '4' => 'Setuju', '5' => 'Sangat Setuju']);
        $trueFalseUnknown = $choice(['benar' => 'Benar', 'salah' => 'Salah', 'tidak_tahu' => 'Tidak Tahu']);
        $sections = [
            ['key' => 'A', 'stage' => 'initial', 'title' => 'A. Data Demografi & Perilaku Media Sosial', 'instruction' => 'Jawab sesuai keadaan dan pengalamanmu.', 'items' => [
                ['A01', 'Nama / Inisial', 'short_text'],
                ['A02', 'Usia (tahun)', 'integer'],
                ['A03', 'Jenis Kelamin', 'single_choice', $choice(['laki_laki' => 'Laki-laki', 'perempuan' => 'Perempuan'])],
                ['A04', 'Kelas / Tingkat', 'single_choice', $choice(['10_sma_smk' => '10 SMA/SMK', '11_sma_smk' => '11 SMA/SMK', '12_sma_smk' => '12 SMA/SMK', 'mahasiswa_lainnya' => 'Mahasiswa / Lainnya'])],
                ['A05', 'Media sosial yang paling sering Anda gunakan (boleh pilih maksimal 2)', 'multiple_choice', $choice(['instagram' => 'Instagram', 'tiktok' => 'TikTok', 'youtube' => 'YouTube', 'whatsapp_telegram' => 'WhatsApp / Telegram', 'x_discord' => 'X (Twitter) / Discord'])],
                ['A06', 'Durasi penggunaan media sosial per hari', 'single_choice', $choice(['kurang_1_jam' => '< 1 jam', '1_3_jam' => '1–3 jam', '4_5_jam' => '4–5 jam', 'lebih_5_jam' => '> 5 jam'])],
                ['A07', 'Apakah Anda pernah melihat atau berinteraksi dengan konten edukasi kesehatan/obat di media sosial?', 'single_choice', $choice(['pernah_interaksi' => 'Pernah (suka/simpan/bagikan)', 'pernah_melihat' => 'Pernah (hanya lewat/melihat)', 'belum_pernah' => 'Belum pernah'])],
            ]],
            ['key' => 'B', 'stage' => 'initial', 'title' => 'B. Paparan Informasi Antibiotik dan Resistensi (ABX & AMR)', 'instruction' => 'Jawab sesuai pengalamanmu.', 'items' => [
                ['B01', 'Seberapa sering Anda melihat informasi mengenai cara penggunaan antibiotik atau bahaya resistensi antibiotik (AMR) di media internet/sosial?', 'single_choice', $choice(['tidak_pernah' => 'Tidak Pernah', 'jarang' => 'Jarang', 'kadang' => 'Kadang-kadang', 'sering' => 'Sering', 'sangat_sering' => 'Sangat Sering'])],
                ['B02', 'Dari mana Anda paling sering menerima informasi mengenai antibiotik? (boleh pilih lebih dari satu)', 'multiple_choice_exclusive', $choice(['media_sosial' => 'Media sosial (Instagram/TikTok/YouTube)', 'website_aplikasi' => 'Website/Aplikasi Kesehatan Digital (misal: ABX Guard)', 'tenaga_kesehatan' => 'Dokter / Apoteker / Tenaga Kesehatan', 'guru_sekolah' => 'Guru / Sekolah', 'keluarga_teman' => 'Orang Tua / Keluarga / Teman', 'tidak_tahu_tidak_pernah' => 'Tidak tahu / Tidak pernah'])],
            ]],
            ['key' => 'C', 'stage' => 'initial', 'title' => 'C. Digital Health Literacy (I-HEALS adaptasi)', 'instruction' => 'Pilih angka 1 (Sangat Tidak Setuju) sampai 5 (Sangat Setuju).', 'items' => [
                ['C01', 'Saya tahu cara mencari informasi kesehatan yang berguna di internet/media sosial.', 'likert', $likert],
                ['C02', 'Saya tahu di mana menemukan informasi kesehatan yang terpercaya secara online.', 'likert', $likert],
                ['C03', 'Saya tahu cara menggunakan internet untuk menjawab pertanyaan saya tentang obat/kesehatan.', 'likert', $likert],
                ['C04', 'Saya dapat membedakan informasi kesehatan yang benar (fakta) dan salah (mitos/hoaks) di internet.', 'likert', $likert],
                ['C05', 'Saya merasa percaya diri menggunakan informasi dari internet untuk membuat keputusan tentang kesehatan saya.', 'likert', $likert],
            ]],
            ['key' => 'D1', 'stage' => 'initial', 'title' => 'D1. Pengetahuan tentang Antibiotik, AMR, dan Mikrobioma', 'instruction' => 'Pilih salah satu jawaban. Belum ada skor benar/salah yang dihitung.', 'items' => [
                ['D101', 'Antibiotik adalah obat yang efektif untuk membunuh atau menghentikan pertumbuhan bakteri.', 'true_false_unknown', $trueFalseUnknown],
                ['D102', 'Batuk, flu, dan demam yang disebabkan oleh virus dapat disembuhkan dengan antibiotik.', 'true_false_unknown', $trueFalseUnknown],
                ['D103', 'Resistensi Antimikroba (AMR) terjadi ketika bakteri menjadi kebal terhadap antibiotik.', 'true_false_unknown', $trueFalseUnknown],
                ['D104', 'Penggunaan antibiotik secara sembarangan atau tidak dihabiskan dapat menyebabkan kuman kebal (AMR).', 'true_false_unknown', $trueFalseUnknown],
                ['D105', 'Penggunaan antibiotik dapat membunuh bakteri baik dalam usus (mikrobioma usus).', 'true_false_unknown', $trueFalseUnknown],
                ['D106', 'Makanan fermentasi/probiotik (seperti yogurt atau minuman asam laktat) membantu menjaga kesehatan pencernaan setelah/selama minum obat.', 'true_false_unknown', $trueFalseUnknown],
            ]],
            ['key' => 'D2', 'stage' => 'initial', 'title' => 'D2. Persepsi dan Sikap terhadap Penggunaan Antibiotik (HBM)', 'instruction' => 'Pilih angka 1 (Sangat Tidak Setuju) sampai 5 (Sangat Setuju).', 'items' => [
                ['D201', 'Saya merasa cemas jika resistensi antibiotik (AMR) menjadi ancaman kesehatan bagi masyarakat di masa depan.', 'likert', $likert],
                ['D202', 'Saya percaya bahwa antibiotik seharusnya hanya digunakan jika diresepkan oleh dokter atau direkomendasikan oleh apoteker.', 'likert', $likert],
                ['D203', 'Saya merasa perlu berkonsultasi dengan apoteker/tenaga kesehatan sebelum membeli obat antibiotik.', 'likert', $likert],
                ['D204', 'Menjaga keseimbangan bakteri baik (mikrobioma usus) adalah hal penting untuk menjaga daya tahan tubuh saya.', 'likert', $likert],
            ]],
            ['key' => 'E', 'stage' => 'initial', 'title' => 'E. Praktik Penggunaan Antibiotik dan Swamedikasi', 'instruction' => 'Pilih jawaban yang paling sesuai dengan kebiasaan Anda. Item tentang cara memperoleh antibiotik dapat ditandai tidak berlaku bila Anda belum pernah menggunakannya.', 'items' => [
                ['E01', 'Kapan terakhir kali Anda menggunakan antibiotik?', 'single_choice', $choice(['kurang_1_bulan' => '< 1 bulan terakhir', '1_6_bulan' => '1–6 bulan terakhir', 'lebih_6_sampai_1_tahun' => '> 6 bulan – 1 tahun lalu', 'lupa_tidak_pernah' => 'Lupa / Tidak pernah'])],
                ['E02', 'Bagaimana cara Anda mendapatkan antibiotik tersebut terakhir kali?', 'single_choice', $choice(['resep_dokter' => 'Menggunakan resep dokter', 'beli_tanpa_resep' => 'Membeli sendiri di apotek/toko obat tanpa resep', 'sisa_pengobatan' => 'Menggunakan sisa obat dari pengobatan sebelumnya', 'dari_orang_lain' => 'Meminta dari keluarga / teman'])],
                ['E03', 'Apakah Anda pernah menghentikan penggunaan antibiotik sebelum waktunya hanya karena merasa gejala sakit sudah membaik?', 'single_choice', $choice(['ya' => 'Ya', 'tidak' => 'Tidak', 'belum_pernah_minum' => 'Belum pernah minum antibiotik'])],
                ['E04', 'Apakah Anda pernah meminta/membujuk dokter atau apoteker agar memberikan antibiotik saat Anda sakit flu/demam?', 'single_choice', $choice(['ya' => 'Ya', 'tidak' => 'Tidak'])],
                ['E05', 'Jika Anda mengalami batuk atau flu biasa, apakah Anda akan langsung membeli antibiotik tanpa konsultasi resep/apoteker?', 'single_choice', $choice(['ya_sering' => 'Ya (Selalu/Sering)', 'kadang' => 'Kadang-kadang', 'tidak_pernah' => 'Tidak pernah'])],
                ['E06', 'Apa yang Anda lakukan jika memiliki sisa obat antibiotik di rumah?', 'single_choice', $choice(['simpan' => 'Menyimpannya untuk digunakan saat sakit lagi di lain waktu', 'berikan' => 'Memberikannya kepada teman/keluarga yang sakitnya sama', 'buang_serahkan' => 'Membuangnya / Menyerahkannya ke fasilitas kesehatan'])],
            ]],
            ['key' => 'F', 'stage' => 'evaluation', 'title' => 'F. Evaluasi Penerimaan / Kemanfaatan Platform Digital', 'instruction' => 'Bagian ini diisi setelah Anda mendapatkan pemaparan atau mencoba platform.', 'items' => [
                ['F01', 'Fitur peringatan dini (Smart ABX Alert) membantu saya berpikir dua kali sebelum buru-buru membeli antibiotik.', 'likert', $likert],
                ['F02', 'Fitur edukasi mikrobioma dan pangan fungsional (Microbiome Care) menambah wawasan baru bagi saya.', 'likert', $likert],
                ['F03', 'Fitur konsultasi apoteker (Pharmacist Connect) memudahkan saya untuk bertanya tentang aturan minum obat.', 'likert', $likert],
                ['F04', 'Secara keseluruhan, platform ini menarik dan mudah digunakan oleh remaja/siswa.', 'likert', $likert],
            ]],
            ['key' => 'G', 'stage' => 'evaluation', 'title' => 'G. System Usability Scale (SUS)', 'instruction' => 'Khusus evaluasi platform setelah pemaparan. Jawaban mentah disimpan; skor SUS belum dihitung sampai kesesuaian instrumen disetujui.', 'items' => [
                ['G01', 'Saya berpikir akan sering menggunakan platform/aplikasi edukasi ini kembali.', 'likert', $likert],
                ['G02', 'Saya merasa platform ini terlalu rumit untuk digunakan.', 'likert', $likert],
                ['G03', 'Saya merasa platform ini sangat mudah digunakan.', 'likert', $likert],
                ['G04', 'Saya membutuhkan bantuan orang lain atau teknisi untuk bisa menggunakan platform ini.', 'likert', $likert],
                ['G05', 'Saya menemukan fitur-fitur (seperti Smart Alert, Symptom Check) terintegrasi dengan sangat baik.', 'likert', $likert],
                ['G06', 'Saya merasa ada terlalu banyak hal yang tidak konsisten pada platform ini.', 'likert', $likert],
                ['G07', 'Saya rasa kebanyakan orang/siswa akan cepat memahami cara penggunaan platform ini dengan mudah.', 'likert', $likert],
                ['G08', 'Saya merasa platform ini sangat membingungkan saat digunakan.', 'likert', $likert],
                ['G09', 'Saya merasa sangat percaya diri saat menggunakan platform ini.', 'likert', $likert],
                ['G10', 'Saya perlu mempelajari banyak hal terlebih dahulu sebelum bisa menggunakan platform ini.', 'likert', $likert],
            ]],
            ['key' => 'H', 'stage' => 'evaluation', 'title' => 'H. Analisis Kualitatif Deskriptif (Acceptability & Feedback)', 'instruction' => 'Bagikan tanggapanmu dengan kata-katamu sendiri. Jawaban terbuka bersifat opsional.', 'items' => [
                ['H01', 'Bagaimana perasaan atau tanggapan Anda ketika melihat peringatan otomatis (Smart Alert) saat ingin memilih antibiotik untuk gejala flu/batuk?', 'long_text', null, false],
                ['H02', 'Informasi baru apa yang paling berkesan bagi Anda terkait hubungan antara penggunaan antibiotik dan kesehatan usus (mikrobioma)?', 'long_text', null, false],
                ['H03', 'Apa kendala atau saran Anda terhadap alur konsultasi apoteker dan materi edukasi digital yang diberikan?', 'long_text', null, false],
            ]],
        ];

        foreach ($sections as $sectionIndex => $sectionData) {
            $section = $instrument->sections()->updateOrCreate(['key' => $sectionData['key']], [
                'stage' => $sectionData['stage'], 'title' => $sectionData['title'],
                'instruction' => $sectionData['instruction'], 'sort' => $sectionIndex + 1,
            ]);

            foreach ($sectionData['items'] as $itemIndex => $itemData) {
                [$code, $prompt, $type] = $itemData;
                $section->items()->updateOrCreate(['code' => $code], [
                    'prompt' => $prompt,
                    'answer_type' => $type,
                    'options' => $itemData[3] ?? null,
                    'required' => $itemData[4] ?? true,
                    'sort' => $itemIndex + 1,
                ]);
            }
        }
    }
}
