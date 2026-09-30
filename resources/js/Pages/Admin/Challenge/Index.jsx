import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatCard from '@/Components/Admin/StatCard';
import BarChart from '@/Components/Admin/BarChart';
import FilterBar from '@/Components/Admin/FilterBar';
import Pagination from '@/Components/Admin/Pagination';
import EmptyState from '@/Components/Admin/EmptyState';
import { fmtDateTime } from '@/Components/Admin/util';

export default function ChallengeIndex({ summary, attempts, pagination, filters }) {
    return (
        <AdminLayout title="AMR Challenge">
            <Head title="Admin — AMR Challenge" />
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total attempts" value={summary.total} />
                <StatCard label="Selesai" value={summary.completed} />
                <StatCard label="Rata-rata skor" value={summary.averagePercent !== null ? `${summary.averagePercent}%` : '—'} />
            </div>
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="dist">
                <h2 id="dist" className="font-bold">Distribusi skor</h2>
                <div className="mt-4">{summary.completed > 0 ? <BarChart data={summary.distribution} label="Jumlah attempt per skor" /> : <EmptyState title="Belum ada attempt selesai" />}</div>
            </section>
            <h2 className="mb-2 mt-8 font-bold">Attempt terbaru</h2>
            <FilterBar action="/admin/challenge" values={filters} fields={[{ name: 'q', label: 'Cari nama atau email', type: 'text' }]} />
            {attempts.length === 0 ? <EmptyState title="Tidak ada attempt yang cocok" /> : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50"><tr>{['ID', 'User', 'Email', 'Skor', 'Selesai'].map((h) => <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {attempts.map((a) => (
                                <tr key={a.id}>
                                    <td className="px-4 py-3"><Link href={`/admin/challenge/${a.id}`} className="font-medium text-teal-700 underline">#{a.id}</Link></td>
                                    <td className="px-4 py-3">{a.name}</td><td className="px-4 py-3">{a.email}</td>
                                    <td className="px-4 py-3 font-semibold">{a.score}/{a.total}</td><td className="px-4 py-3">{fmtDateTime(a.completedAt)}</td>
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
