// Sumber: PROTOTIPE ABX GUARD.pdf, bagian 7 (BAL & Functional Food).
export const BAL = {
    intro: 'Bakteri Asam Laktat (BAL) merupakan kelompok bakteri yang banyak berperan dalam proses fermentasi pangan dan menghasilkan asam laktat sebagai salah satu produk metabolisme. Beberapa kelompok yang termasuk BAL antara lain bakteri dari genus:',
    genera: ['Lactobacillus sensu lato', 'Lactococcus', 'Leuconostoc', 'Pediococcus', 'Streptococcus'],
    outro: 'BAL banyak dimanfaatkan dalam pembuatan berbagai produk pangan fermentasi.',
};

export const FERMENTED = {
    intro: 'Pangan fermentasi merupakan pangan yang mengalami proses fermentasi melalui aktivitas mikroorganisme. Contohnya:',
    items: [
        { icon: '🥛', title: 'Yoghurt', text: 'Produk susu yang difermentasi menggunakan mikroorganisme tertentu.' },
        { icon: '🥬', title: 'Kimchi', text: 'Sayuran yang mengalami fermentasi oleh komunitas mikroorganisme tertentu.' },
        { icon: '🫙', title: 'Sauerkraut', text: 'Sayuran yang difermentasi dan menghasilkan lingkungan asam selama proses fermentasi.' },
        { icon: '🫘', title: 'Tempe', text: 'Produk berbahan dasar kedelai yang dibuat melalui proses fermentasi menggunakan kapang tertentu.' },
    ],
    important: 'Tidak semua pangan fermentasi otomatis dapat disebut sebagai sumber probiotik. Untuk disebut sebagai probiotik, mikroorganisme harus memenuhi kriteria tertentu, termasuk memiliki bukti manfaat kesehatan pada inang.',
};

export const BIOTICS = [
    { key: 'probiotik', title: 'Probiotik', icon: '🦠',
      definition: 'Mikroorganisme hidup yang apabila dikonsumsi dalam jumlah yang memadai memberikan manfaat kesehatan bagi inang.',
      points: ['Manfaat probiotik tidak dapat digeneralisasikan untuk semua jenis mikroorganisme. Manfaat dapat bergantung pada: spesies; strain; jumlah mikroorganisme; produk; kondisi yang menjadi tujuan penggunaan.', 'Beberapa mikroorganisme dari kelompok Lactobacillus dan Bifidobacterium telah digunakan dalam produk probiotik. Namun, keberadaan mikroorganisme tersebut dalam suatu produk tidak otomatis berarti semua produk memberikan manfaat yang sama.'],
      note: 'Bukti manfaat probiotik bersifat spesifik terhadap strain dan kondisi penggunaannya.' },
    { key: 'prebiotik', title: 'Prebiotik', icon: '🌾',
      definition: 'Substrat yang secara selektif dimanfaatkan oleh mikroorganisme inang dan memberikan manfaat kesehatan.',
      points: ['Prebiotik merupakan komponen yang dapat dimanfaatkan oleh mikroorganisme tertentu dan mendukung fungsi mikrobiota yang bermanfaat bagi tubuh.', 'Prebiotik dapat ditemukan pada beberapa jenis pangan yang mengandung komponen seperti serat pangan tertentu. Contoh sumber: bawang; bawang putih; pisang; asparagus; beberapa jenis serealia dan pangan nabati.'],
      note: 'Kandungan prebiotik dapat berbeda-beda tergantung jenis bahan pangan dan pengolahannya.' },
    { key: 'sinbiotik', title: 'Sinbiotik', icon: '🤝',
      definition: 'Produk atau kombinasi yang mengandung mikroorganisme hidup dan substrat yang secara selektif dimanfaatkan oleh mikroorganisme inang sehingga memberikan manfaat kesehatan.',
      points: ['Sinbiotik menggabungkan komponen probiotik dan substrat yang sesuai untuk mendukung manfaat kesehatan.'],
      note: 'Tidak semua kombinasi probiotik dan prebiotik otomatis memberikan manfaat yang sama. Komponen dan bukti manfaat perlu diperhatikan.' },
    { key: 'postbiotik', title: 'Postbiotik', icon: '🧪',
      definition: 'Preparat dari mikroorganisme yang tidak hidup dan/atau komponennya yang memberikan manfaat kesehatan bagi inang.',
      points: ['Postbiotik berbeda dengan probiotik.', 'Probiotik: menggunakan mikroorganisme hidup.', 'Postbiotik: menggunakan preparat dari mikroorganisme yang tidak hidup dan/atau komponennya dengan manfaat kesehatan yang telah ditunjukkan.'],
      note: null },
];
