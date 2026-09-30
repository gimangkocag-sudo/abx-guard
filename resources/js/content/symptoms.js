// Sumber: PROTOTIPE ABX GUARD.pdf, bagian Symptom Check. Tidak ada materi klinis tambahan.
export const SYMPTOMS = [
    { id: 'batuk', label: 'Batuk', icon: '🫁', example: 'batuk-pilek' },
    { id: 'pilek', label: 'Pilek', icon: '🤧', example: 'batuk-pilek' },
    { id: 'nyeri-tenggorokan', label: 'Nyeri tenggorokan', icon: '🗣️', example: null },
    { id: 'demam', label: 'Demam', icon: '🌡️', example: 'demam' },
    { id: 'diare', label: 'Diare', icon: '💧', example: 'diare' },
    { id: 'mual-muntah', label: 'Mual atau muntah', icon: '🤢', example: null },
    { id: 'nyeri-perut', label: 'Nyeri perut', icon: '🤕', example: null },
    { id: 'gi-lain', label: 'Keluhan saluran pencernaan lainnya', icon: '🩺', example: null },
];

export const GENERAL =
    'Keluhan seperti batuk, pilek, nyeri tenggorokan, demam, atau diare dapat disebabkan oleh berbagai kondisi. Adanya gejala saja tidak cukup untuk menentukan apakah seseorang membutuhkan antibiotik. Antibiotik bekerja terhadap bakteri tertentu dan tidak bekerja terhadap virus. Oleh karena itu, kebutuhan antibiotik perlu ditentukan berdasarkan kondisi pasien dan pertimbangan tenaga kesehatan.';

export const EXAMPLES = {
    'batuk-pilek': { title: 'Batuk dan pilek', text: 'Batuk dan pilek dapat terjadi akibat infeksi virus maupun kondisi lainnya. Karena itu, munculnya batuk atau pilek tidak otomatis berarti seseorang membutuhkan antibiotik.' },
    demam: { title: 'Demam', text: 'Demam merupakan gejala yang dapat muncul pada berbagai kondisi. Demam saja tidak dapat digunakan sebagai dasar untuk menentukan penggunaan antibiotik.' },
    diare: { title: 'Diare', text: 'Diare dapat memiliki berbagai penyebab. Tidak semua diare membutuhkan antibiotik. Penanganannya perlu disesuaikan dengan penyebab dan kondisi individu.' },
};

export const NOTE =
    'Symptom Check bukan alat diagnosis dan tidak menentukan apakah seseorang membutuhkan antibiotik. Jika keluhan berat, menetap, atau memburuk, segera konsultasikan dengan tenaga kesehatan.';
