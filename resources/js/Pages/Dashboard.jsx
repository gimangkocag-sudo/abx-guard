import { Head, Link } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import Button from '@/Components/Abx/Button';
import Card from '@/Components/Abx/Card';
import ProgressBar from '@/Components/Abx/ProgressBar';
import Disclaimer from '@/Components/Abx/Disclaimer';

export default function Dashboard({ auth = {}, surveyDone = false, surveyAvailable = true, surveySubmittedAt = null, challenge = {}, progress = {} }) {
    const safeProgress = { done: 0, total: 0, percent: 0, modules: [], continue: null, ...(progress ?? {}) };
    safeProgress.modules = Array.isArray(safeProgress.modules) ? safeProgress.modules : [];
    const safeChallenge = { best: null, attempts: 0, lastAttemptId: null, ...(challenge ?? {}) };
    const isAdmin = auth?.user?.role === 'admin';
    return (
        <AbxLayout>
            <Head title="Dashboard" />
            <PageContainer>
                <h1 className="break-words text-2xl font-bold text-teal-950 sm:text-3xl">Halo, {auth?.user?.name ?? 'pengguna'} 👋</h1>
                <p className="mt-1 text-gray-700">Selamat datang di pusat belajar ABX Guard.</p>

                <Card className="mt-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-teal-950">Progress belajar</h2>
                        <span className="text-right text-sm font-semibold text-teal-800">{safeProgress.done}/{safeProgress.total} materi · {safeProgress.percent}%</span>
                    </div>
                    <ProgressBar className="mt-3" value={safeProgress.done} max={Math.max(safeProgress.total, 1)} label="Progress belajar" />
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {safeProgress.modules.map((m) => (
                            <li key={m.slug}>
                                <Link href={`/belajar/${m.slug}`} className="flex min-h-12 items-center gap-2 rounded-xl px-3 py-2 text-gray-800 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                                    <span aria-hidden="true">{m.visited ? '✅' : '⬜'}</span>
                                    <span>{m.title}</span>
                                    <span className="sr-only">{m.visited ? '(sudah dibuka)' : '(belum dibuka)'}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4">
                        {safeProgress.continue ? (
                            <Button href={`/belajar/${safeProgress.continue.slug}`} variant="secondary">Lanjutkan belajar: {safeProgress.continue.title}</Button>
                        ) : (
                            <p className="font-medium text-teal-900">Semua materi sudah kamu buka. Terima kasih sudah belajar!</p>
                        )}
                    </div>
                </Card>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <Card>
                        <p className="text-sm font-semibold text-teal-700">KAP Survey</p>
                        <p className="mt-1 text-lg font-bold">{surveyDone ? 'Survey Sudah Diisi' : 'Belum Diisi'}</p>
                        {surveyDone ? (
                            <p className="mt-1 text-sm text-gray-600">{surveySubmittedAt ? new Date(surveySubmittedAt).toLocaleDateString('id-ID', { timeZone: 'UTC' }) : 'Selesai'}</p>
                        ) : surveyAvailable ? (
                            <Button href="/kap-survey" className="mt-4 w-full">Mulai KAP Survey</Button>
                        ) : <p className="mt-2 text-sm text-gray-600">Survei belum tersedia saat ini.</p>}
                    </Card>
                    <Card>
                        <p className="text-sm font-semibold text-teal-700">AMR Challenge</p>
                        <p className="mt-1 text-lg font-bold">{safeChallenge.best ? `Skor terbaik ${safeChallenge.best.score}/${safeChallenge.best.total}` : 'Belum dicoba'}</p>
                        {safeChallenge.attempts > 0 && <p className="mt-1 text-sm text-gray-600">{safeChallenge.attempts} kali percobaan</p>}
                        <Button href="/amr-challenge" variant="secondary" className="mt-4 w-full">{safeChallenge.attempts > 0 ? 'Coba lagi' : 'Mulai challenge'}</Button>
                    </Card>
                    <Card>
                        <p className="text-sm font-semibold text-teal-700">Jelajahi ABX Guard</p>
                        <p className="mt-1 text-lg font-bold">Jelajahi materi & alat</p>
                        <div className="mt-4 grid gap-2">
                            <Button href="/cek-keluhan" variant="secondary" className="w-full">Cek Keluhan</Button>
                            <Button href="/" variant="ghost" className="w-full">Beranda ABX Guard</Button>
                        </div>
                    </Card>
                </div>

                {isAdmin && <p className="mt-6"><Link href="/admin" className="font-medium text-teal-700 underline">Buka Admin Dashboard</Link></p>}
                <Disclaimer className="mt-8" />
            </PageContainer>
        </AbxLayout>
    );
}
