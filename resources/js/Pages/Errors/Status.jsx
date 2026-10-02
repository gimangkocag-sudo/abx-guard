import { Head, Link } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import Button from '@/Components/Abx/Button';

const COPY = {
    403: ['Akses tidak diizinkan', 'Anda tidak memiliki akses ke halaman ini.'],
    404: ['Halaman tidak ditemukan', 'Halaman yang Anda cari tidak tersedia atau tautannya sudah berubah.'],
    419: ['Sesi berakhir', 'Sesi Anda telah berakhir. Muat ulang halaman, lalu coba kembali.'],
    500: ['Terjadi kendala', 'Halaman belum dapat dimuat. Coba lagi beberapa saat lagi.'],
    503: ['Layanan sementara tidak tersedia', 'Layanan sedang tidak dapat digunakan. Silakan coba kembali nanti.'],
};

export default function Status({ status = 500 }) {
    const [title, message] = COPY[status] ?? COPY[500];
    return (
        <AbxLayout>
            <Head title={`${status} | ABX GUARD`} />
            <section className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
                <p className="text-sm font-bold tracking-widest text-teal-800">ABX GUARD · {status}</p>
                <h1 className="mt-3 text-3xl font-bold text-teal-950">{title}</h1>
                <p className="mt-3 max-w-prose text-slate-700">{message}</p>
                <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
                    <Button href="/">Kembali ke Beranda</Button>
                    <button type="button" onClick={() => window.history.back()} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-teal-300 bg-white px-5 font-semibold text-teal-900 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Kembali ke halaman sebelumnya</button>
                </div>
            </section>
        </AbxLayout>
    );
}
