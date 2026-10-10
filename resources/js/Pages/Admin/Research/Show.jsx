import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const stages = { initial: 'Tahap awal (A–E)', evaluation: 'Evaluasi platform (F–H)' };

function display(item) {
    if (item.status === 'not_applicable') return 'Tidak berlaku';
    if (item.status === 'not_answered') return 'Tidak dijawab';
    if (item.value === null || item.value === '') return 'Tidak dijawab';
    const decoded = ['multiple_choice', 'multiple_choice_exclusive'].includes(item.type) ? JSON.parse(item.value || '[]') : [item.value];
    return decoded.map((value) => item.options.find((option) => String(option.value) === String(value))?.label ?? value).join(', ');
}

export default function ResearchShow({ submission, sections = [] }) {
    return <AdminLayout title="Detail Survei Penelitian">
        <Head title={`Submission #${submission.id}`} />
        <div className="mx-auto max-w-4xl space-y-5">
            <Link href="/admin/research-survey" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-teal-800 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Kembali ke survei penelitian</Link>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Submission #{submission.id} · Versi {submission.version}</p><h1 className="mt-2 text-2xl font-bold text-teal-950">{stages[submission.stage] ?? submission.stage}</h1><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-slate-600">Nama akun</dt><dd className="font-medium text-slate-900">{submission.userName ?? 'Akun dihapus'}</dd></div><div><dt className="text-slate-600">Email akun</dt><dd className="font-medium text-slate-900">{submission.userEmail ?? '—'}</dd></div><div><dt className="text-slate-600">Status</dt><dd className="font-medium text-slate-900">{submission.status}</dd></div><div><dt className="text-slate-600">Waktu mulai / kirim</dt><dd className="font-medium text-slate-900">{submission.startedAt ? new Date(submission.startedAt).toLocaleString('id-ID') : '—'} / {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('id-ID') : 'Belum dikirim'}</dd></div>{submission.stage === 'initial' && <div><dt className="text-slate-600">Konfirmasi paparan evaluasi</dt><dd className="font-medium text-slate-900">{submission.evaluationUnlockedAt ? new Date(submission.evaluationUnlockedAt).toLocaleString('id-ID') : 'Belum dikonfirmasi'}</dd></div>}</dl></section>
            {sections.map((section) => <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><h2 className="text-lg font-bold text-teal-950">{section.title}</h2><dl className="mt-4 space-y-4">{section.items.map((item) => <div key={item.code} className="border-t border-slate-100 pt-3"><dt className="text-sm leading-6 text-slate-800"><span className="mr-2 font-bold text-teal-800">{item.code}</span>{item.prompt}</dt><dd className={`mt-2 whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-sm ${item.status === 'answered' ? 'bg-teal-50 text-teal-950' : 'bg-slate-100 text-slate-700'}`}>{display(item)}</dd></div>)}</dl></section>)}
        </div>
    </AdminLayout>;
}
