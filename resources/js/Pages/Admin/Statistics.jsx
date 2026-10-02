import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import FilterBar from '@/Components/Admin/FilterBar';
import BarChart from '@/Components/Admin/BarChart';
import DistributionBar from '@/Components/Admin/DistributionBar';
import EmptyState from '@/Components/Admin/EmptyState';
import { qs } from '@/Components/Admin/util';

const PALETTE = { knowledge: 'neutral', agreement: 'agreement', frequency: 'gradient' };

function QuestionStat({ q, palette, showMean }) {
    return (
        <li className="py-4">
            <p className="text-sm font-medium text-slate-900"><span className="mr-2 font-mono text-xs text-slate-500">{q.code}</span>{q.text}</p>
            <p className="mb-2 text-xs text-slate-500">{q.responses} jawaban{showMean && q.mean !== null && ` · rata-rata ${q.mean}`}</p>
            <DistributionBar items={q.distribution} responses={q.responses} palette={palette} />
        </li>
    );
}

export default function Statistics({ stats, surveys, filters }) {
    const fields = [
        { name: 'survey', label: 'Versi survey', type: 'select', options: surveys.map((s) => ({ value: String(s.id), label: s.label })) },
        { name: 'from', label: 'Tanggal mulai', type: 'date' },
        { name: 'to', label: 'Tanggal akhir', type: 'date' },
    ];
    const exportHref = `/admin/export/kap?${qs({ survey: filters.survey, from: filters.from, to: filters.to })}`;
    return (
        <AdminLayout title="Statistik KAP">
            <Head title="Admin — Statistik KAP" />
            <FilterBar action="/admin/statistics" values={{ survey: filters.survey, from: filters.from, to: filters.to }} fields={fields}>
                <a href={exportHref} className="ml-auto inline-flex min-h-11 items-center rounded-lg border border-teal-700 px-4 text-sm font-semibold text-teal-800 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Unduh CSV sesuai filter</a>
            </FilterBar>

            <div className="mb-6 rounded-xl border-l-4 border-teal-500 bg-white p-4 text-sm shadow-sm">
                Statistik untuk <strong>KAP Survey v{stats.survey.version}</strong> (survey_id {stats.survey.id}) — <strong>{stats.total}</strong> responden pada rentang yang dipilih. Versi survey yang berbeda tidak pernah digabung.
            </div>

            {stats.total === 0 ? <EmptyState title="Belum ada responden">Tidak ada submission untuk versi dan rentang tanggal ini.</EmptyState> : stats.sections.map((s) => (
                <section key={s.key} className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby={`st-${s.key}`}>
                    <h2 id={`st-${s.key}`} className="text-lg font-bold uppercase tracking-wide text-teal-800">{s.title}</h2>
                    {s.key === 'knowledge' && <p className="mt-1 text-xs text-slate-500">Distribusi Benar/Salah/Tidak tahu per pertanyaan. Kunci jawaban tidak didefinisikan pada survei, sehingga tidak ada skor benar/salah.</p>}

                    {s.key === 'attitude' && (
                        <div className="mt-4"><p className="mb-2 text-sm font-semibold">Rata-rata per item (skala 1–5)</p>
                            <BarChart data={s.questions.map((q) => ({ label: q.code, value: q.mean ?? 0 }))} max={5} label="Rata-rata skor Attitude per item" /></div>
                    )}
                    {s.key === 'acceptance' && s.groups.length > 0 && (
                        <div className="mt-4"><p className="mb-2 text-sm font-semibold">Rata-rata per kelompok (skala 1–5)</p>
                            <BarChart data={s.groups.map((g) => ({ label: g.name, value: g.mean ?? 0 }))} max={5} label="Rata-rata skor Acceptance per kelompok" /></div>
                    )}

                    {s.groups.length > 0 ? s.groups.map((g) => (
                        <div key={g.name} className="mt-6">
                            <h3 className="font-semibold text-slate-900">{g.name} <span className="text-sm font-normal text-slate-500">· rata-rata {g.mean ?? '—'}</span></h3>
                            <ul className="divide-y divide-slate-100">{s.questions.filter((q) => q.group === g.name).map((q) => <QuestionStat key={q.id} q={q} palette={PALETTE[s.scale]} showMean />)}</ul>
                        </div>
                    )) : <ul className="mt-2 divide-y divide-slate-100">{s.questions.map((q) => <QuestionStat key={q.id} q={q} palette={PALETTE[s.scale]} showMean={s.key === 'attitude'} />)}</ul>}
                </section>
            ))}
        </AdminLayout>
    );
}
