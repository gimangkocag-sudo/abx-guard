import { Link } from '@inertiajs/react';

export default function Pagination({ meta }) {
    if (!meta || meta.total === 0) return null;
    const btn = 'inline-flex min-h-10 items-center rounded-lg border px-4 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500';
    return (
        <nav aria-label="Paginasi" className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Menampilkan {meta.from}–{meta.to} dari {meta.total} · halaman {meta.current}/{meta.last}</p>
            <div className="flex gap-2">
                {meta.prevUrl ? <Link href={meta.prevUrl} preserveScroll className={`${btn} border-slate-300 bg-white hover:bg-slate-50`}>← Sebelumnya</Link>
                    : <span aria-disabled="true" className={`${btn} cursor-not-allowed border-slate-200 text-slate-400`}>← Sebelumnya</span>}
                {meta.nextUrl ? <Link href={meta.nextUrl} preserveScroll className={`${btn} border-slate-300 bg-white hover:bg-slate-50`}>Berikutnya →</Link>
                    : <span aria-disabled="true" className={`${btn} cursor-not-allowed border-slate-200 text-slate-400`}>Berikutnya →</span>}
            </div>
        </nav>
    );
}
