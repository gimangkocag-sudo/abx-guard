import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import FilterBar from '@/Components/Admin/FilterBar';
import Pagination from '@/Components/Admin/Pagination';
import EmptyState from '@/Components/Admin/EmptyState';
import { fmtDateTime, qs } from '@/Components/Admin/util';

export default function SurveyIndex({ rows, pagination, filters, surveys, exportSurvey }) {
    const fields = [
        { name: 'q', label: 'Cari nama, email, atau ID', type: 'text' },
        { name: 'survey', label: 'Versi survey', type: 'select', options: [{ value: '', label: 'Semua versi' }, ...surveys.map((s) => ({ value: String(s.id), label: s.label }))] },
        { name: 'from', label: 'Dari tanggal', type: 'date' },
        { name: 'to', label: 'Sampai tanggal', type: 'date' },
    ];
    const exportHref = `/admin/export/kap?${qs({ ...filters, survey: filters.survey || exportSurvey.id })}`;
    return (
        <AdminLayout title="KAP Survey — Responses">
            <Head title="Admin — KAP Responses" />
            <FilterBar action="/admin/survey" values={filters} fields={fields}>
                <a href={exportHref} className="ml-auto inline-flex min-h-11 items-center rounded-lg border border-teal-700 px-4 text-sm font-semibold text-teal-800 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Unduh CSV (v{exportSurvey.version})</a>
            </FilterBar>
            <p className="-mt-2 mb-4 text-xs text-slate-600">Export selalu untuk satu versi survey dan mengikuti filter di atas. Jika “Semua versi” dipilih, export memakai versi default (v{exportSurvey.version}).</p>
            {rows.length === 0 ? <EmptyState title="Tidak ada submission yang cocok">Ubah filter atau rentang tanggal.</EmptyState> : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50"><tr>{['ID', 'User', 'Email', 'Versi', 'Submitted at', 'Status'].map((h) => <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => (
                                <tr key={r.id}>
                                    <td className="px-4 py-3"><Link href={`/admin/survey/${r.id}`} className="font-medium text-teal-700 underline">#{r.id}</Link></td>
                                    <td className="px-4 py-3">{r.name}</td><td className="px-4 py-3">{r.email}</td><td className="px-4 py-3">v{r.version}</td>
                                    <td className="px-4 py-3">{fmtDateTime(r.submittedAt)}</td><td className="px-4 py-3">{r.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination meta={pagination} />
        </AdminLayout>
    );
}
