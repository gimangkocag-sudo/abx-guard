// Sumber: PROTOTIPE ABX GUARD.pdf, bagian 4 (Bijak Antibiotik).
export const BIJAK = [
    { title: 'Apa Itu Antibiotik?', icon: '💊', blocks: [
        { type: 'p', text: 'Antibiotik adalah obat yang digunakan untuk menangani infeksi yang disebabkan oleh bakteri tertentu. Antibiotik dapat bekerja dengan menghambat pertumbuhan bakteri atau membunuh bakteri. Antibiotik memiliki peran penting dalam pengobatan infeksi bakteri. Namun, antibiotik tidak bekerja terhadap virus.' },
        { type: 'note', label: 'Ingat:', text: 'Antibiotik bukan obat untuk semua jenis penyakit. Batuk, pilek, atau demam tidak otomatis membutuhkan antibiotik. Penyebab keluhan perlu dipertimbangkan terlebih dahulu.' },
    ] },
    { title: 'Kapan Antibiotik Digunakan?', icon: '🩺', blocks: [
        { type: 'p', text: 'Antibiotik digunakan ketika terdapat infeksi bakteri tertentu yang membutuhkan terapi antibiotik berdasarkan penilaian tenaga kesehatan. Pemilihan antibiotik dapat mempertimbangkan beberapa hal, seperti:' },
        { type: 'ul', items: ['jenis dan lokasi infeksi;', 'kondisi pasien;', 'kemungkinan mikroorganisme penyebab;', 'riwayat penggunaan obat;', 'alergi obat;', 'serta pertimbangan klinis lainnya.'] },
        { type: 'p', text: 'Karena itu, jangan menentukan sendiri jenis antibiotik hanya berdasarkan gejala.' },
    ] },
    { title: 'Kapan Antibiotik Tidak Tepat Digunakan?', icon: '🚫', blocks: [
        { type: 'p', text: 'Antibiotik tidak digunakan untuk mengatasi infeksi virus. Contohnya, flu biasa dan sebagian besar common cold disebabkan oleh virus, sehingga antibiotik tidak memberikan manfaat terhadap virus tersebut. Namun, gejala yang terlihat serupa dapat memiliki penyebab yang berbeda. Oleh karena itu, penentuan terapi tetap membutuhkan pertimbangan tenaga kesehatan.' },
        { type: 'marks', mark: '✗', label: 'Jangan berpikir:', items: ['“Saya demam berarti membutuhkan antibiotik.”', '“Saya batuk berarti membutuhkan antibiotik.”', '“Saya pilek berarti membutuhkan antibiotik.”'] },
        { type: 'marks', mark: '✓', label: 'Lebih tepat:', items: ['“Saya perlu mengetahui penyebab keluhan dan menggunakan obat sesuai kebutuhan.”'] },
    ] },
    { title: 'Jangan Menggunakan Antibiotik Sisa', icon: '♻️', blocks: [
        { type: 'p', text: 'Masih menyimpan antibiotik dari pengobatan sebelumnya?' },
        { type: 'p', text: 'Jangan langsung digunakan kembali. Antibiotik sisa belum tentu sesuai dengan kondisi yang sedang dialami. Jenis obat, dosis, lama penggunaan, dan kebutuhan terapi dapat berbeda pada setiap kondisi.' },
        { type: 'note', label: 'Ingat:', text: 'Antibiotik sisa bukan persediaan obat untuk digunakan sendiri ketika sakit kembali. Jika memiliki antibiotik sisa, konsultasikan dengan apoteker mengenai cara penanganan obat tersebut.' },
    ] },
    { title: 'Jangan Berbagi Antibiotik', icon: '✋', blocks: [
        { type: 'p', text: 'Antibiotik bukan obat yang dapat dibagikan. Obat yang sesuai untuk seseorang belum tentu sesuai untuk orang lain.' },
        { type: 'marks', mark: '✗', label: 'Jangan:', items: ['menggunakan antibiotik milik orang lain;', 'memberikan antibiotik kepada orang lain;', 'menggunakan resep atau antibiotik orang lain sebagai dasar pengobatan sendiri.'] },
    ] },
    { title: 'Gunakan Sesuai Petunjuk', icon: '📋', blocks: [
        { type: 'p', text: 'Jika mendapatkan antibiotik dari tenaga kesehatan:' },
        { type: 'dl', items: [
            { term: 'Perhatikan dosis', text: 'Gunakan sesuai jumlah yang telah ditentukan.' },
            { term: 'Perhatikan frekuensi', text: 'Gunakan sesuai waktu atau frekuensi yang diberikan.' },
            { term: 'Perhatikan lama penggunaan', text: 'Ikuti durasi penggunaan sesuai instruksi tenaga kesehatan.' },
            { term: 'Jangan mengubah penggunaan sendiri', text: 'Jangan menaikkan, mengurangi, menghentikan, atau mengganti antibiotik tanpa berkonsultasi.' },
        ] },
    ] },
    { title: 'Tanyakan jika belum memahami', icon: '💬', blocks: [
        { type: 'p', text: 'Apoteker dapat membantu menjelaskan cara penggunaan antibiotik agar kamu memahami obat yang digunakan.' },
    ] },
];
