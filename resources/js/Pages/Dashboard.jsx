import { Head, Link } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import Button from '@/Components/Abx/Button';
import Card from '@/Components/Abx/Card';
import ProgressBar from '@/Components/Abx/ProgressBar';
import Disclaimer from '@/Components/Abx/Disclaimer';

export default function Dashboard({ auth, surveyDone, surveySubmittedAt, challenge, progress }) {
    const isAdmin = auth.user.role === 'admin';
    return (
        <AbxLayout>
            <Head title="Dashboard" />
            <PageContainer>
                <h1 className="text-3xl font-bold text-teal-950">Halo, {auth.user.name} 👋</h1>
                <p className="mt-1 text-gray-700">Selamat datang di pusat belajar ABX Guard.</p>

                <Card className="mt-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-teal-950">Progress belajar</h2>
                        <span className="text-sm font-semibold text-teal-800">{progress.done}/{progress.total} materi · {progress.percent}%</span>
                    </div>
                    <ProgressBar className="mt-3" value={progress.done} max={progress.total} label="Progress belajar" />
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {progress.modules.map((m) => (
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
                        {progress.continue ? (
                            <Button href={`/belajar/${progress.continue.slug}`} variant="secondary">Continue Learning: {progress.continue.title}</Button>
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
                            <p className="mt-1 text-sm text-gray-600">{new Date(surveySubmittedAt).toLocaleDateString('id-ID')}</p>
                        ) : (
                            <Button href="/kap-survey" className="mt-4 w-full">Mulai KAP Survey</Button>
                        )}
                    </Card>
                    <Card>
                        <p className="text-sm font-semibold text-teal-700">AMR Challenge</p>
                        <p className="mt-1 text-lg font-bold">{challenge.best ? `Best Score ${challenge.best.score}/${challenge.best.total}` : 'Belum dicoba'}</p>
                        {challenge.attempts > 0 && <p className="mt-1 text-sm text-gray-600">{challenge.attempts}× percobaan</p>}
                        <Button href="/amr-challenge" variant="secondary" className="mt-4 w-full">{challenge.attempts > 0 ? 'Coba Lagi' : 'Start Challenge'}</Button>
                    </Card>
                    <Card>
                        <p className="text-sm font-semibold text-teal-700">Explore ABX Guard</p>
                        <p className="mt-1 text-lg font-bold">Jelajahi materi & alat</p>
                        <div className="mt-4 grid gap-2">
                            <Button href="/cek-keluhan" variant="secondary" className="w-full">Symptom Check</Button>
                            <Button href="/" variant="ghost" className="w-full">Home ABX Guard</Button>
                        </div>
                    </Card>
                </div>

                {isAdmin && <p className="mt-6"><Link href="/admin" className="font-medium text-teal-700 underline">Buka Admin Dashboard</Link></p>}
                <Disclaimer className="mt-8" />
            </PageContainer>
        </AbxLayout>
    );
}
