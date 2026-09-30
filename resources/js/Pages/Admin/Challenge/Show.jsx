import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { fmtDateTime } from '@/Components/Admin/util';

export default function ChallengeShow({ attempt, review, respondent }) {
    return (
        <AdminLayout title={`Attempt #${attempt.id}`} actions={<Link href="/admin/challenge" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">← Kembali</Link>}>
            <Head title={`Admin — Attempt #${attempt.id}`} />
            <dl className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-4">
                {[['Nama', respondent.name], ['Email', respondent.email], ['Skor', `${attempt.score}/${attempt.total}`], ['Selesai', fmtDateTime(attempt.completedAt)]].map(([k, v]) => (
                    <div key={k}><dt className="text-xs font-semibold uppercase text-slate-500">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>
                ))}
            </dl>
            <ol className="mt-6 space-y-3">
                {review.map((r, i) => (
                    <li key={i} className={`rounded-2xl border-l-4 bg-white p-4 shadow-sm ${r.isCorrect ? 'border-emerald-600' : 'border-rose-500'}`}>
                        <p className="font-semibold">{i + 1}. “{r.statement}”</p>
                        <p className="mt-1 text-sm font-bold">{r.isCorrect ? '✓ Benar' : '✗ Kurang tepat'} · jawaban: {r.answer.toUpperCase()} · kunci: {r.correctAnswer.toUpperCase()}</p>
                        <p className="mt-1 text-sm text-slate-700">{r.explanation}</p>
                    </li>
                ))}
            </ol>
        </AdminLayout>
    );
}
