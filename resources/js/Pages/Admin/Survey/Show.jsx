import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { fmtDateTime } from '@/Components/Admin/util';

export default function SurveyShow({ submission, sections }) {
    return (
        <AdminLayout title={`Submission #${submission.id}`} actions={<Link href="/admin/survey" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">← Kembali ke daftar</Link>}>
            <Head title={`Admin — Submission #${submission.id}`} />
            <dl className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                {[['Nama', submission.name], ['Email', submission.email], ['Waktu submission', fmtDateTime(submission.submittedAt)], ['Versi survey', `v${submission.version}`]].map(([k, v]) => (
                    <div key={k}><dt className="text-xs font-semibold uppercase text-slate-500">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>
                ))}
            </dl>

            {sections.map((s) => (
                <section key={s.key} className="mt-6" aria-labelledby={`s-${s.key}`}>
                    <h2 id={`s-${s.key}`} className="mb-2 font-bold uppercase tracking-wide text-teal-800">{s.title} <span className="font-normal normal-case text-slate-500">({s.questions.length} item)</span></h2>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50"><tr>
                                <th scope="col" className="w-16 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Kode</th>
                                {s.questions.some((q) => q.group) && <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Kelompok</th>}
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Pertanyaan</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Jawaban</th>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {s.questions.map((q) => (
                                    <tr key={q.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{q.code}</td>
                                        {s.questions.some((x) => x.group) && <td className="px-4 py-3 text-slate-600">{q.group}</td>}
                                        <td className="px-4 py-3">{q.text}</td>
                                        <td className="px-4 py-3 font-semibold">{q.label ?? '—'}{q.value && /^\d$/.test(q.value) && <span className="ml-1 font-normal text-slate-500">({q.value})</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ))}
        </AdminLayout>
    );
}
