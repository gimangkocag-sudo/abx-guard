// Sumber: PROTOTIPE ABX GUARD.pdf (Home, Smart ABX Alert, Myth or Fact, Pharmacist Connect, Closing Page).
export const EXPLORE = [
    { icon: '🧫', title: 'Kenali AMR', href: '/belajar/amr', text: 'Pahami resistensi antimikroba dan bagaimana penggunaannya berkaitan dengan kesehatan masyarakat.' },
    { icon: '💊', title: 'Bijak Antibiotik', href: '/belajar/bijak-antibiotik', text: 'Pelajari penggunaan antibiotik secara tepat dan bertanggung jawab.' },
    { icon: '🌿', title: 'Jaga Mikrobioma', href: '/belajar/mikrobioma', text: 'Kenali mikrobiota usus dan faktor yang dapat memengaruhi keseimbangannya.' },
    { icon: '🥛', title: 'Pangan Fungsional', href: '/belajar/pangan-fungsional', text: 'Kenali Bakteri Asam Laktat dan pangan fungsional.' },
    { icon: '💬', title: 'Tanya Apoteker', href: '/belajar/pharmacist-connect', text: 'Tanyakan informasi mengenai obat dan penggunaan antibiotik kepada apoteker.' },
    { icon: '🎯', title: 'AMR Challenge', href: '/amr-challenge', text: 'Uji pengetahuanmu dalam 5 pertanyaan!' },
    { icon: '📝', title: 'KAP Survey', href: '/kap-survey', text: 'Kenali pemahamanmu tentang antibiotik.' },
];

export const CLOSING = {
    text: 'Antibiotik merupakan obat penting untuk menangani infeksi bakteri tertentu. Penggunaannya secara tepat membantu menjaga efektivitas antibiotik dan mengurangi risiko resistensi.',
    items: [
        { key: 'THINK', text: 'Apakah saya benar-benar membutuhkan antibiotik?' },
        { key: 'LEARN', text: 'Apakah saya sudah memahami obat yang akan digunakan?' },
        { key: 'ASK', text: 'Sudahkah saya berkonsultasi dengan tenaga kesehatan?' },
        { key: 'CARE', text: 'Bagaimana menjaga kesehatan mikrobioma sebagai bagian dari kesehatan secara keseluruhan?' },
    ],
    tagline: 'Bijak menggunakan antibiotik hari ini untuk menjaga efektivitasnya di masa depan.',
};

export const ALERT = {
    example: 'Saya mengalami batuk dan pilek. Saya ingin minum antibiotik.',
    title: 'Tunggu sebelum menggunakan antibiotik.',
    text: 'Tidak semua batuk dan pilek membutuhkan antibiotik. Banyak keluhan saluran pernapasan disebabkan oleh virus, sedangkan antibiotik digunakan untuk menangani infeksi bakteri tertentu. Penggunaan antibiotik yang tidak tepat dapat menyebabkan obat digunakan ketika tidak diperlukan dan dapat berkontribusi terhadap munculnya resistensi antibiotik.',
    questions: [
        'Apakah antibiotik tersebut diresepkan untuk kondisi saya saat ini?',
        'Apakah saya sudah berkonsultasi dengan tenaga kesehatan?',
        'Apakah antibiotik tersebut merupakan sisa obat dari pengobatan sebelumnya?',
    ],
    doubt: 'Jika kamu masih ragu, jangan menggunakan antibiotik berdasarkan perkiraan sendiri.',
    ctas: [
        { label: 'Pelajari AMR', href: '/belajar/amr' },
        { label: 'Konsultasi Apoteker', href: '/belajar/pharmacist-connect' },
        { label: 'Pelajari Antibiotik', href: '/belajar/bijak-antibiotik' },
    ],
};

export const MYTH_FACT = [
    { id: 1, statement: 'Probiotik dapat menggantikan antibiotik.', correct_answer: 'mitos', explanation: 'Probiotik dan antibiotik memiliki tujuan yang berbeda. Probiotik tidak digunakan sebagai pengganti antibiotik ketika seseorang membutuhkan terapi untuk infeksi bakteri tertentu.' },
    { id: 2, statement: 'Semua yoghurt otomatis merupakan probiotik.', correct_answer: 'mitos', explanation: 'Produk yoghurt dapat mengandung mikroorganisme hasil fermentasi, tetapi tidak semua produk memenuhi kriteria probiotik.' },
    { id: 3, statement: 'Antibiotik adalah obat untuk flu biasa.', correct_answer: 'mitos', explanation: 'Flu biasa umumnya disebabkan oleh virus, sedangkan antibiotik bekerja terhadap bakteri.' },
    { id: 4, statement: 'Antibiotik sisa aman digunakan kembali.', correct_answer: 'mitos', explanation: 'Antibiotik sisa belum tentu sesuai dengan kondisi yang sedang dialami. Jangan menggunakan kembali antibiotik sisa tanpa konsultasi tenaga kesehatan.' },
    { id: 5, statement: 'Antibiotik dapat memengaruhi mikrobiota usus.', correct_answer: 'fakta', explanation: 'Antibiotik dapat menyebabkan perubahan pada komposisi dan keragaman mikrobiota, tergantung pada jenis antibiotik, durasi penggunaan, dan faktor individu.' },
];

export const PHARMACIST = {
    intro: 'Apoteker dapat membantu memberikan informasi mengenai penggunaan obat, termasuk antibiotik, serta membantu mengidentifikasi masalah yang berkaitan dengan penggunaan obat.',
    roles: [
        { no: '01', title: 'Edukasi penggunaan obat', text: 'Membantu masyarakat memahami cara penggunaan obat dengan benar.' },
        { no: '02', title: 'Edukasi antibiotik', text: 'Memberikan informasi mengenai penggunaan antibiotik secara rasional.' },
        { no: '03', title: 'Identifikasi masalah penggunaan obat', text: 'Membantu pengguna mengenali masalah yang mungkin terjadi selama penggunaan obat.' },
        { no: '04', title: 'Edukasi AMR', text: 'Meningkatkan pemahaman masyarakat mengenai resistensi antimikroba.' },
        { no: '05', title: 'Rujukan', text: 'Jika kondisi pengguna membutuhkan pemeriksaan atau penanganan lebih lanjut, apoteker dapat mengarahkan pengguna untuk mendapatkan pelayanan kesehatan yang sesuai.' },
    ],
    examples: [
        { q: 'Saya punya antibiotik sisa dari pengobatan sebelumnya. Apakah boleh digunakan lagi?', a: 'Sebaiknya antibiotik sisa tidak langsung digunakan kembali. Kondisi yang sedang kamu alami belum tentu memiliki penyebab yang sama dengan penyakit sebelumnya dan belum tentu membutuhkan antibiotik yang sama. Konsultasikan kondisi kamu dengan tenaga kesehatan sebelum menggunakan antibiotik.' },
        { q: 'Saya batuk dan pilek. Apakah saya perlu minum antibiotik?', a: 'Batuk dan pilek tidak selalu disebabkan oleh bakteri. Banyak kasus disebabkan oleh virus sehingga antibiotik tidak memberikan manfaat terhadap penyebab tersebut. Jika keluhan mengganggu, menetap, atau memburuk, sebaiknya konsultasikan dengan tenaga kesehatan untuk mendapatkan penilaian yang sesuai.' },
        { q: 'Saya lupa minum antibiotik. Apa yang harus saya lakukan?', a: 'Penanganan dosis yang terlupa dapat bergantung pada jenis antibiotik dan waktu keterlambatan. Periksa petunjuk penggunaan obat atau konsultasikan dengan apoteker agar mendapatkan informasi yang sesuai dengan antibiotik yang digunakan.' },
    ],
    disclaimer: 'ABX Guard tidak menggantikan konsultasi langsung dengan tenaga kesehatan.',
};
