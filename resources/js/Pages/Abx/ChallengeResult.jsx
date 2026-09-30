import { Head } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import Button from '@/Components/Abx/Button';
import Card from '@/Components/Abx/Card';
import CTASection from '@/Components/Abx/CTASection';
import Disclaimer from '@/Components/Abx/Disclaimer';
import FadeIn from '@/Components/Abx/FadeIn';

export default function ChallengeResult({ attempt, review }) {
    const perfect = attempt.score === attempt.total;
    return (
        <AbxLayout>
            <Head title="Hasil AMR Challenge" />
            <PageContainer className="max-w-3xl">
                <FadeIn>
                    <Card className="text-center sm:p-10" role="status">
                        <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Hasil AMR Challenge</p>
                        <h1 className="mt-2 text-4xl font-extrabold text-teal-950">
                            {attempt.score}/{attempt.total}{perfect ? ' — Antibiotic Smart!' : ''}
                        </h1>
                        <p className="mt-3 text-gray-700">
                            {perfect
                                ? 'Kamu sudah memahami dasar penggunaan antibiotik dan resistensi antimikroba.'
                                : 'Tinjau penjelasan di bawah, lalu pelajari materinya untuk memperdalam pemahamanmu.'}
                        </p>
                        <Button href="/amr-challenge" variant="secondary" className="mt-5">Coba Lagi</Button>
                    </Card>
                </FadeIn>

                <h2 className="mb-3 mt-10 text-xl font-bold text-teal-950">Tinjauan jawaban</h2>
                <ol className="space-y-3">
                    {review.map((r, i) => (
                        <li key={i} className={`rounded-2xl border-l-4 bg-white p-4 shadow-sm ${r.isCorrect ? 'border-emerald-600' : 'border-rose-500'}`}>
                            <p className="font-semibold text-gray-900">{i + 1}. “{r.statement}”</p>
                            <p className="mt-1 text-sm font-bold">
                                {r.isCorrect ? '✓ Benar' : '✗ Kurang tepat'} · jawabanmu: {r.answer.toUpperCase()} · kunci: {r.correctAnswer.toUpperCase()}
                            </p>
                            <p className="mt-1 text-gray-700">{r.explanation}</p>
                        </li>
                    ))}
                </ol>

                <div className="mt-10">
                    <CTASection title="Mau belajar lebih lanjut?" actions={[
                        { label: 'Kenali AMR', href: '/belajar/amr' },
                        { label: 'Pelajari Mikrobioma', href: '/belajar/mikrobioma' },
                        { label: 'Bijak Menggunakan Antibiotik', href: '/belajar/bijak-antibiotik' },
                        { label: 'Tanya Apoteker', href: '/belajar/pharmacist-connect' },
                    ]} />
                </div>
                <Disclaimer className="mt-10" />
            </PageContainer>
        </AbxLayout>
    );
}
