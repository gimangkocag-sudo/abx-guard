import { Head, Link } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import Button from '@/Components/Abx/Button';
import Card from '@/Components/Abx/Card';
import ProgressBar from '@/Components/Abx/ProgressBar';
import Disclaimer from '@/Components/Abx/Disclaimer';

function ModuleStatus({ visited }) {
    return (
        <span className="flex h-7 w-7 flex-none items-center justify-center" aria-hidden="true">
            <svg viewBox="0 0 24 24" className={`h-6 w-6 ${visited ? 'text-teal-700' : 'text-slate-300'}`} fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" fill={visited ? 'currentColor' : 'white'} className={visited ? 'opacity-10' : ''} />
                {visited && <path d="m8 12.2 2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
        </span>
    );
}

export default function Dashboard({ auth = {}, challenge = {}, progress = {}, mythFact = {}, researchSurvey = {} }) {
    const safeProgress = { done: 0, total: 0, percent: 0, modules: [], continue: null, ...(progress ?? {}) };
    safeProgress.modules = Array.isArray(safeProgress.modules) ? safeProgress.modules : [];
    const safeChallenge = { best: null, attempts: 0, lastAttemptId: null, ...(challenge ?? {}) };
    const safeMythFact = { attempts: 0, latest: null, ...(mythFact ?? {}) };
    const isAdmin = auth?.user?.role === 'admin';
    return (
        <AbxLayout>
            <Head title="Dashboard" />
            <PageContainer className="max-w-5xl py-6 sm:py-8">
                <header className="max-w-2xl">
                    <h1 className="break-words text-2xl font-bold tracking-tight text-teal-950 sm:text-3xl">Halo, {auth?.user?.name ?? 'pengguna'} 👋</h1>
                    <p className="mt-1.5 text-base leading-7 text-slate-600">Selamat datang di pusat belajar ABX Guard.</p>
                </header>

                <Card className="mt-6 sm:mt-7">
                    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                        <h2 className="text-lg font-semibold tracking-tight text-teal-950 sm:text-xl">Progress belajar</h2>
                        <p className="flex flex-none items-baseline gap-2 whitespace-nowrap text-sm text-slate-600">
                            <span className="text-xl font-bold tabular-nums text-teal-950">{safeProgress.done}/{safeProgress.total}</span>
                            <span>materi</span>
                            <span aria-hidden="true" className="text-slate-400">·</span>
                            <span className="font-semibold tabular-nums text-teal-800">{safeProgress.percent}%</span>
                        </p>
                    </div>
                    <ProgressBar className="mt-4" value={safeProgress.done} max={Math.max(safeProgress.total, 1)} label="Progress belajar" />
                    <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {safeProgress.modules.map((m) => {
                            const isMythFact = m.slug === 'myth-or-fact';
                            const latest = safeMythFact.latest;
                            const status = latest ? `Sudah dicoba · Nilai terbaru ${latest.score}/${latest.total}` : 'Belum dicoba';

                            return (
                                <li key={m.slug}>
                                    <Link href={`/belajar/${m.slug}`} className="group flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-teal-200 hover:bg-teal-50/60 hover:text-teal-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">
                                        <ModuleStatus visited={isMythFact ? Boolean(latest) : m.visited} />
                                        <span className="min-w-0 break-words leading-5">{isMythFact ? 'MITOS/FAKTA' : m.title}{isMythFact && <span className="mt-0.5 block text-xs font-normal text-slate-500">{status}</span>}</span>
                                        <span className="sr-only">{isMythFact ? `(${status})` : m.visited ? '(sudah dibuka)' : '(belum dibuka)'}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="mt-4 border-t border-slate-100 pt-4">
                        {safeProgress.continue ? (
                            <Button href={`/belajar/${safeProgress.continue.slug}`} variant="secondary">Lanjutkan belajar: {safeProgress.continue.title}</Button>
                        ) : (
                            <p className="text-sm font-medium text-teal-900">Semua materi sudah kamu buka. Terima kasih sudah belajar!</p>
                        )}
                    </div>
                </Card>

                <div className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 lg:mt-7 lg:grid-cols-3">
                    <Card className="flex h-full min-h-52 flex-col">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Survei Penelitian</p>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{researchSurvey.initialStatus === 'submitted' ? 'Tahap awal selesai' : researchSurvey.initialStatus === 'draft' ? 'Draft tersimpan' : researchSurvey.available ? 'Bagikan pengalamanmu' : 'Belum tersedia'}</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{researchSurvey.initialStatus === 'submitted' ? researchSurvey.evaluationStatus === 'submitted' ? 'Tahap awal dan evaluasi platform sudah dikirim.' : 'Evaluasi platform tersedia setelah pemaparan atau mencoba platform.' : researchSurvey.initialStatus === 'draft' ? 'Lanjutkan pengisian dari jawaban yang tersimpan.' : 'Jawabanmu membantu evaluasi edukasi ABX Guard.'}</p>
                        </div>
                        {researchSurvey.available && <div className="mt-auto pt-5"><Button href={researchSurvey.initialStatus === 'submitted' ? '/survei-penelitian?stage=evaluation' : '/survei-penelitian'} className="w-full">{researchSurvey.initialStatus === 'submitted' ? researchSurvey.evaluationStatus === 'submitted' ? 'Lihat survei' : 'Buka evaluasi' : researchSurvey.initialStatus === 'draft' ? 'Lanjutkan survei' : 'Mulai survei'}</Button></div>}
                    </Card>

                    <Card className="flex h-full min-h-52 flex-col">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">AMR Challenge</p>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{safeChallenge.best ? `Skor terbaik ${safeChallenge.best.score}/${safeChallenge.best.total}` : 'Belum dicoba'}</h2>
                            {safeChallenge.attempts > 0 && <p className="mt-2 text-sm leading-6 text-slate-600">{safeChallenge.attempts} kali percobaan</p>}
                        </div>
                        <div className="mt-auto pt-5"><Button href="/amr-challenge" className="w-full">{safeChallenge.attempts > 0 ? 'Coba lagi' : 'Mulai challenge'}</Button></div>
                    </Card>

                    <Card className="flex h-full min-h-52 flex-col">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Jelajahi ABX Guard</p>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Jelajahi materi &amp; alat</h2>
                        </div>
                        <div className="mt-auto grid gap-2 pt-6">
                            <Button href="/cek-keluhan" className="w-full">Cek Keluhan</Button>
                            <Button href="/" variant="secondary" className="w-full">Beranda ABX Guard</Button>
                        </div>
                    </Card>
                </div>

                {isAdmin && <aside aria-label="Utilitas admin" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Admin</p><p className="mt-0.5 text-sm text-slate-700">Akses pengelolaan platform</p></div><Link href="/admin" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Buka Admin Dashboard <span aria-hidden="true" className="ml-1">→</span></Link></aside>}
                <Disclaimer className="mt-7" />
            </PageContainer>
        </AbxLayout>
    );
}
