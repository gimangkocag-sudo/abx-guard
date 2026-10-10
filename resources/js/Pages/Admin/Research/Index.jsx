import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const stages = { initial: 'Tahap awal (A–E)', evaluation: 'Evaluasi (F–H)' };
const statuses = { submitted: 'Terkirim', draft: 'Draft' };
const date = (value) => value ? new Date(value).toLocaleString('id-ID') : '—';

export default function ResearchIndex({ title, rows = [], pagination = {}, filters = {}, summary = {}, sections = [], versions = [] }) {
    const query = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== null && value !== undefined && value !== ''))).toString();
    const exportHref = `/admin/research-survey/export${query ? `?${query}` : ''}`;

    return <AdminLayout title={title}>
        <Head title="Survei Penelitian" />
        <div className="mx-auto max-w-7xl space-y-5">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan survei">
                {[
                    ['Responden', summary.respondents], ['Submission terkirim', summary.submissions],
                    ['Draft tersimpan', summary.drafts], ['Tahap awal / evaluasi', `${summary.initial ?? 0} / ${summary.evaluation ?? 0}`],
                ].map(([label, value]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-600">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-teal-950">{value ?? 0}</p></article>)}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-teal-950">Filter data</h2><a href={exportHref} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">Ekspor CSV</a></div>
                <form method="get" action="/admin/research-survey" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <label className="text-sm font-medium text-slate-700">Versi<select name="version" defaultValue={filters.version ?? ''} className="mt-1 min-h-11 w-full rounded-lg border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"><option value="">Semua versi</option>{versions.map((version) => <option key={version} value={version}>Versi {version}</option>)}</select></label>
                    <label className="text-sm font-medium text-slate-700">Tahap<select name="stage" defaultValue={filters.stage ?? ''} className="mt-1 min-h-11 w-full rounded-lg border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"><option value="">Semua tahap</option><option value="initial">Tahap awal</option><option value="evaluation">Evaluasi</option></select></label>
                    <label className="text-sm font-medium text-slate-700">Status<select name="status" defaultValue={filters.status ?? ''} className="mt-1 min-h-11 w-full rounded-lg border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"><option value="">Semua status</option><option value="submitted">Terkirim</option><option value="draft">Draft</option></select></label>
                    <label className="text-sm font-medium text-slate-700">Dari tanggal<input type="date" name="from" defaultValue={filters.from ?? ''} className="mt-1 min-h-11 w-full rounded-lg border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600" /></label>
                    <label className="text-sm font-medium text-slate-700">Sampai tanggal<input type="date" name="to" defaultValue={filters.to ?? ''} className="mt-1 min-h-11 w-full rounded-lg border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600" /></label>
                    <label className="text-sm font-medium text-slate-700">Nama/email/ID<input type="search" name="q" defaultValue={filters.q ?? ''} maxLength="100" className="mt-1 min-h-11 w-full rounded-lg border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600" /></label>
                    <div className="flex items-end gap-2 xl:col-span-6"><button className="inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Terapkan filter</button><a href="/admin/research-survey" className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-teal-900 hover:bg-slate-50">Reset</a></div>
                </form>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h2 className="px-4 py-4 text-lg font-semibold text-teal-950 sm:px-5">Submission</h2>
                <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600"><tr><th className="px-4 py-3">Responden</th><th className="px-4 py-3">Tahap</th><th className="px-4 py-3">Versi / Status</th><th className="px-4 py-3">Dimulai</th><th className="px-4 py-3">Dikirim</th><th className="px-4 py-3">Detail</th></tr></thead><tbody className="divide-y divide-slate-100">
                    {rows.map((row) => <tr key={row.id} className="align-top"><td className="px-4 py-3"><p className="font-semibold text-slate-900">{row.userName ?? 'Akun dihapus'}</p><p className="mt-0.5 text-xs text-slate-600">{row.userEmail ?? `ID akun ${row.userId ?? '—'}`}</p></td><td className="px-4 py-3">{stages[row.stage] ?? row.stage}</td><td className="px-4 py-3">v{row.version} · {statuses[row.status] ?? row.status}</td><td className="px-4 py-3 whitespace-nowrap">{date(row.startedAt)}</td><td className="px-4 py-3 whitespace-nowrap">{date(row.submittedAt)}</td><td className="px-4 py-3"><Link href={`/admin/research-survey/${row.id}`} className="inline-flex min-h-10 items-center rounded-lg px-2 font-semibold text-teal-800 underline underline-offset-2 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Lihat jawaban</Link></td></tr>)}
                    {!rows.length && <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-600">Belum ada submission yang sesuai filter.</td></tr>}
                </tbody></table></div>
                <nav aria-label="Paginasi submission" className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm"><span className="text-slate-600">Halaman {pagination.current ?? 1} dari {pagination.last ?? 1}</span><div className="flex gap-2">{pagination.prevUrl && <Link href={pagination.prevUrl} className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 text-teal-900">Sebelumnya</Link>}{pagination.nextUrl && <Link href={pagination.nextUrl} className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 text-teal-900">Berikutnya</Link>}</div></nav>
            </section>

            <section className="space-y-3" aria-labelledby="distribution-heading"><h2 id="distribution-heading" className="text-xl font-bold text-teal-950">Distribusi jawaban per item</h2><p className="text-sm text-slate-600">Ringkasan deskriptif dari jawaban mentah. Tidak ada skor pengetahuan atau klaim kausal.</p>
                {sections.map((section) => <details key={`${section.key}-${section.stage}`} className="rounded-2xl border border-slate-200 bg-white shadow-sm"><summary className="min-h-12 cursor-pointer px-4 py-3 font-semibold text-teal-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">{section.title} · {stages[section.stage]}</summary><div className="space-y-3 border-t border-slate-100 p-4">{section.items.map((item) => <article key={item.code} className="rounded-xl border border-slate-100 p-3"><h3 className="text-sm font-medium leading-6 text-slate-900"><span className="mr-2 font-bold text-teal-800">{item.code}</span>{item.prompt}</h3><ul className="mt-2 flex flex-wrap gap-2">{Object.entries(item.distribution).map(([label, count]) => <li key={label} className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-950">{label}: <strong>{count}</strong></li>)}{!Object.keys(item.distribution).length && <li className="text-xs text-slate-500">Belum ada jawaban.</li>}</ul></article>)}</div></details>)}
            </section>
        </div>
    </AdminLayout>;
}
