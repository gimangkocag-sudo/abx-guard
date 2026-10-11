import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import SectionHeader from '@/Components/Abx/SectionHeader';
import Button from '@/Components/Abx/Button';
import Card from '@/Components/Abx/Card';
import QuizPlayer from '@/Components/Abx/QuizPlayer';
import CTASection from '@/Components/Abx/CTASection';
import Disclaimer from '@/Components/Abx/Disclaimer';

export default function MythOrFact({ auth = {}, questions = [] }) {
    const [phase, setPhase] = useState('intro');
    const [answers, setAnswers] = useState({});
    const [round, setRound] = useState(0);
    const [attempt, setAttempt] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const isAuthenticated = Boolean(auth?.user);

    const check = async (q, answer) => ({ correct: answer === q.correct_answer, correct_answer: q.correct_answer, explanation: q.explanation });
    const localScore = questions.filter((q) => answers[q.id] === q.correct_answer).length;

    const finish = async (submittedAnswers) => {
        setAnswers(submittedAnswers);
        setSaveError(null);

        if (!isAuthenticated) {
            setAttempt({ score: questions.filter((q) => submittedAnswers[q.id] === q.correct_answer).length, total: questions.length });
            setPhase('done');
            return;
        }

        setSaving(true);
        try {
            const response = await axios.post('/belajar/myth-or-fact/attempts', { answers: submittedAnswers });
            setAttempt(response.data.attempt);
            setPhase('done');
        } catch {
            setSaveError('Hasil belum tersimpan. Periksa koneksi lalu pilih tombol simpan lagi untuk mencoba kembali.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AbxLayout>
            <Head title="Myth or Fact" />
            <PageContainer className="max-w-3xl">
                <SectionHeader as="h1" eyebrow="Myth or Fact" title="Jangan Salah Paham!" subtitle="Pilih MITOS atau FAKTA untuk setiap pernyataan." />

                {phase === 'intro' && (
                    <Card className="text-center sm:p-10">
                        <p className="text-5xl" aria-hidden="true">🤔</p>
                        <p className="mt-3 text-gray-700">{questions.length} pernyataan. Setelah menjawab, kamu langsung melihat penjelasannya.</p>
                        <Button className="mt-6" onClick={() => setPhase('play')}>Mulai</Button>
                    </Card>
                )}

                {phase === 'play' && (
                    <>
                        {saveError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{saveError}</p>}
                        <QuizPlayer key={round} questions={questions} check={check} finishing={saving} finishLabel={isAuthenticated ? 'Simpan dan lihat hasil' : 'Lihat Ringkasan'} onFinish={finish} />
                    </>
                )}

                {phase === 'done' && (
                    <div>
                        <Card className="text-center sm:p-10" role="status">
                            <p className="text-4xl font-extrabold text-teal-900">{attempt?.score ?? localScore}/{attempt?.total ?? questions.length}</p>
                            <p className="mt-2 text-gray-700">pernyataan dijawab dengan tepat. Baca kembali penjelasan di materi untuk memperdalam pemahamanmu.</p>
                            {isAuthenticated
                                ? <p className="mt-2 text-sm text-emerald-800">Hasil percobaan ini tersimpan di akunmu.</p>
                                : <p className="mt-2 text-sm text-slate-600">Hasil sesi ini belum disimpan. <Link href="/login" className="font-semibold text-blue-700 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">Masuk untuk menyimpan hasil.</Link></p>}
                            <Button className="mt-6" onClick={() => { setAnswers({}); setAttempt(null); setSaveError(null); setRound(round + 1); setPhase('play'); }}>Main lagi</Button>
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
