import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import SectionHeader from '@/Components/Abx/SectionHeader';
import Button from '@/Components/Abx/Button';
import Card from '@/Components/Abx/Card';
import QuizPlayer from '@/Components/Abx/QuizPlayer';
import CTASection from '@/Components/Abx/CTASection';
import Disclaimer from '@/Components/Abx/Disclaimer';
import { MYTH_FACT } from '@/content/misc';

export default function MythOrFact() {
    const [phase, setPhase] = useState('intro');
    const [answers, setAnswers] = useState({});
    const [round, setRound] = useState(0);

    // Konten statis dari PDF; permainan ini tidak menyimpan data. Skor yang disimpan ada di AMR Challenge.
    const check = async (q, answer) => ({ correct: answer === q.correct_answer, correct_answer: q.correct_answer, explanation: q.explanation });
    const score = MYTH_FACT.filter((q) => answers[q.id] === q.correct_answer).length;

    return (
        <AbxLayout>
            <Head title="Myth or Fact" />
            <PageContainer className="max-w-3xl">
                <SectionHeader as="h1" eyebrow="Myth or Fact" title="Jangan Salah Paham!" subtitle="Pilih MITOS atau FAKTA untuk setiap pernyataan." />

                {phase === 'intro' && (
                    <Card className="text-center sm:p-10">
                        <p className="text-5xl" aria-hidden="true">🤔</p>
                        <p className="mt-3 text-gray-700">{MYTH_FACT.length} pernyataan. Setelah menjawab, kamu langsung melihat penjelasannya.</p>
                        <Button className="mt-6" onClick={() => setPhase('play')}>Mulai</Button>
                    </Card>
                )}

                {phase === 'play' && (
                    <QuizPlayer key={round} questions={MYTH_FACT} check={check} finishLabel="Lihat Ringkasan"
                        onFinish={(a) => { setAnswers(a); setPhase('done'); }} />
                )}

                {phase === 'done' && (
                    <div>
                        <Card className="text-center sm:p-10" role="status">
                            <p className="text-4xl font-extrabold text-teal-900">{score}/{MYTH_FACT.length}</p>
                            <p className="mt-2 text-gray-700">pernyataan dijawab dengan tepat. Baca kembali penjelasan di materi untuk memperdalam pemahamanmu.</p>
                            <Button className="mt-6" onClick={() => { setAnswers({}); setRound(round + 1); setPhase('play'); }}>Main lagi</Button>
                        </Card>
                        <div className="mt-8">
                            <CTASection title="Lanjutkan belajar" actions={[{ label: 'AMR Challenge', href: '/amr-challenge' }, { label: 'Bijak Antibiotik', href: '/belajar/bijak-antibiotik' }, { label: 'Pangan Fungsional', href: '/belajar/pangan-fungsional' }]} />
                        </div>
                    </div>
                )}
                <Disclaimer className="mt-10" />
            </PageContainer>
        </AbxLayout>
    );
}
