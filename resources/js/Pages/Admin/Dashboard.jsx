import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatCard from '@/Components/Admin/StatCard';
import BarChart from '@/Components/Admin/BarChart';
import EmptyState from '@/Components/Admin/EmptyState';
import { fmtDateTime } from '@/Components/Admin/util';

export default function Dashboard({ stats, activeInstrument, submissionsPerDay, recent, challenge }) {
    const hasDaily = submissionsPerDay.some((d) => d.value > 0);
    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin Dashboard" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard label="Total pengguna" value={stats.users} />
                <StatCard label="Submission survei baru" value={stats.researchSubmissions} hint={`${stats.researchDrafts} draft tersimpan`} />
                <StatCard label="Tahap awal selesai" value={stats.initialSubmissions} hint={activeInstrument ? `Instrumen v${activeInstrument.version}` : 'Instrumen belum tersedia'} />
                <StatCard label="Percobaan AMR Challenge" value={stats.challengeAttempts} />
                <StatCard label="Evaluasi platform selesai" value={stats.evaluationSubmissions} hint="Tahap setelah pemaparan/penggunaan platform" />
                <StatCard label="Penyelesaian tahap awal" value={`${stats.completion}%`} hint={`${stats.initialSubmissions} dari ${stats.users} pengguna`} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="c1">
                    <h2 id="c1" className="font-bold">Submission survei penelitian per hari (14 hari terakhir)</h2>
                    <div className="mt-4">{hasDaily ? <BarChart data={submissionsPerDay} label="Submission survei penelitian per hari" /> : <EmptyState title="Belum ada submission dalam 14 hari terakhir" />}</div>
                </section>
                <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="c2">
                    <div className="flex items-start justify-between gap-2">
                        <h2 id="c2" className="font-bold">Distribusi skor AMR Challenge</h2>
                        <Link href="/admin/challenge" className="text-sm font-medium text-teal-700 underline">Detail</Link>
                    </div>
                    <p className="text-sm text-slate-600">{challenge.completed} attempt selesai{challenge.averagePercent !== null && ` · rata-rata ${challenge.averagePercent}%`}</p>
                    <div className="mt-4">{challenge.distribution.length > 0 && challenge.completed > 0 ? <BarChart data={challenge.distribution} label="Jumlah attempt per skor" /> : <EmptyState title="Belum ada attempt challenge" />}</div>
                </section>
            </div>

            <section className="mt-6" aria-labelledby="r">
                <div className="mb-2 flex items-center justify-between"><h2 id="r" className="font-bold">Submission terbaru</h2><Link href="/admin/research-survey" className="text-sm font-medium text-teal-700 underline">Lihat semua</Link></div>
                {recent.length === 0 ? <EmptyState title="Belum ada submission" /> : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full text-sm">
                        <thead className="bg-slate-50"><tr>{['ID', 'User', 'Email', 'Tahap', 'Versi', 'Waktu'].map((h) => <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {recent.map((r) => (
                                    <tr key={r.id}>
                                        <td className="px-4 py-3"><Link href={`/admin/research-survey/${r.id}`} className="font-medium text-teal-700 underline">#{r.id}</Link></td>
                                        <td className="px-4 py-3">{r.name}</td><td className="px-4 py-3">{r.email}</td><td className="px-4 py-3">{r.stage === 'initial' ? 'Tahap awal' : 'Evaluasi'}</td><td className="px-4 py-3">v{r.version}</td><td className="px-4 py-3">{fmtDateTime(r.submittedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
