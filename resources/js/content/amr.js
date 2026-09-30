// Sumber: PROTOTIPE ABX GUARD.pdf, bagian 5 (AMR Education).
export const AMR_SECTIONS = [
    { no: '01', title: 'Apa Itu AMR?', blocks: [
        { type: 'p', text: 'AMR atau Antimicrobial Resistance adalah kondisi ketika mikroorganisme mengalami perubahan sehingga obat antimikroba tidak lagi bekerja secara efektif terhadap mikroorganisme tersebut. Mikroorganisme yang dapat mengalami resistensi meliputi:' },
        { type: 'ul', items: ['bakteri;', 'virus;', 'jamur;', 'parasit.'] },
        { type: 'note', label: 'Bagaimana dengan antibiotik?', text: 'Resistensi antibiotik merupakan salah satu bagian dari AMR. Resistensi antibiotik terjadi ketika bakteri menjadi tidak responsif terhadap antibiotik tertentu sehingga infeksi yang disebabkan oleh bakteri tersebut dapat menjadi lebih sulit ditangani.' },
    ] },
    { no: '02', title: 'Mengapa AMR Terjadi?', blocks: [
        { type: 'p', text: 'Resistensi merupakan proses biologis yang dapat terjadi secara alami, tetapi penggunaan antimikroba dapat memberikan tekanan seleksi yang mendukung bertahannya mikroorganisme yang resisten. Beberapa hal yang dapat berkontribusi terhadap masalah AMR antara lain:' },
        { type: 'cards', items: [
            { icon: '⚠️', title: 'Penggunaan antibiotik yang tidak tepat', text: 'Antibiotik digunakan tanpa indikasi atau tidak sesuai kebutuhan.' },
            { icon: '🦠', title: 'Penggunaan antibiotik yang tidak diperlukan', text: 'Antibiotik digunakan pada kondisi yang tidak memberikan manfaat dari antibiotik, seperti infeksi virus.' },
            { icon: '📋', title: 'Penggunaan tidak sesuai instruksi', text: 'Penggunaan obat yang tidak mengikuti petunjuk tenaga kesehatan dapat menyebabkan terapi tidak optimal.' },
            { icon: '🔁', title: 'Penyebaran mikroorganisme resisten', text: 'Mikroorganisme resisten dapat menyebar dari satu individu ke individu lain atau melalui lingkungan.' },
            { icon: '🌍', title: 'Faktor One Health', text: 'AMR tidak hanya berkaitan dengan manusia. Penggunaan antimikroba dan penyebaran resistensi juga berhubungan dengan kesehatan hewan dan lingkungan.' },
        ] },
    ] },
    { no: '03', title: 'Mengapa AMR Penting?', blocks: [
        { type: 'p', text: 'Ketika bakteri menjadi resisten terhadap antibiotik, infeksi yang ditimbulkannya dapat menjadi lebih sulit untuk ditangani. AMR dapat menyebabkan:' },
        { type: 'ul', items: ['pilihan antibiotik efektif menjadi lebih terbatas;', 'pengobatan menjadi lebih kompleks;', 'risiko kegagalan terapi meningkat;', 'lama perawatan dapat bertambah;', 'beban biaya kesehatan dapat meningkat.'] },
        { type: 'p', text: 'Karena itu, mencegah resistensi merupakan tanggung jawab bersama.' },
    ] },
    { no: '04', title: 'Antibiotik dan AMR', special: 'flow', blocks: [
        { type: 'p', text: 'Bagaimana hubungannya? Antibiotik memberikan tekanan seleksi terhadap bakteri. Dalam suatu populasi bakteri, terdapat bakteri yang rentan dan dapat pula terdapat bakteri yang memiliki sifat resisten. Ketika antibiotik digunakan, bakteri yang rentan dapat terhambat atau mati, sementara bakteri yang memiliki sifat resisten dapat bertahan. Jika bakteri resisten tersebut bertahan dan berkembang, resistensi dapat menjadi masalah dalam pengobatan.' },
    ], after: [
        { type: 'note', text: 'Resistensi merupakan proses biologis yang kompleks dan tidak terjadi hanya karena satu kali penggunaan antibiotik.' },
    ] },
    { no: '05', title: 'Bagaimana Mencegah AMR?', special: 'steps', blocks: [], after: [
        { type: 'note', label: 'Ingat:', text: 'Antibiotik yang digunakan dengan tepat membantu menjaga efektivitas antibiotik untuk saat ini dan masa mendatang.' },
    ] },
    { no: '06', title: 'Apa Itu Antimicrobial Stewardship?', blocks: [
        { type: 'p', text: 'Antimicrobial Stewardship (AMS) merupakan pendekatan untuk memastikan penggunaan antimikroba dilakukan secara tepat sehingga pasien memperoleh manfaat terapi yang optimal sekaligus mengurangi penggunaan yang tidak diperlukan dan risiko resistensi. AMS melibatkan:' },
        { type: 'ul', items: ['Dokter', 'Apoteker', 'Tenaga kesehatan lainnya', 'Pasien dan masyarakat'] },
        { type: 'note', label: 'Peran masyarakat: Think Before Antibiotics.', text: 'Sebelum menggunakan antibiotik, cari informasi yang tepat dan konsultasikan dengan tenaga kesehatan.' },
    ] },
];

export const FLOW = [
    'Penggunaan antibiotik yang tidak tepat',
    'Tekanan seleksi terhadap bakteri',
    'Bakteri yang resisten dapat bertahan',
    'Bakteri resisten dapat berkembang dan menyebar',
];

export const STEPS = [
    'Jangan menggunakan antibiotik tanpa konsultasi tenaga kesehatan.',
    'Jangan menggunakan antibiotik sisa dari pengobatan sebelumnya.',
    'Jangan berbagi antibiotik dengan orang lain.',
    'Gunakan antibiotik sesuai instruksi tenaga kesehatan.',
    'Tanyakan kepada apoteker jika memiliki pertanyaan mengenai antibiotik.',
];
