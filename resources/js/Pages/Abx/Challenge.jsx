import { useState } from 'react';
import axios from 'axios';
import { Head, router } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import SectionHeader from '@/Components/Abx/SectionHeader';
import Button from '@/Components/Abx/Button';
import Card from '@/Components/Abx/Card';
import QuizPlayer from '@/Components/Abx/QuizPlayer';
import Disclaimer from '@/Components/Abx/Disclaimer';

export default function Challenge({ questions, summary }) {
    const [playing, setPlaying] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState(null);

    // Umpan balik per pertanyaan datang dari server; skor akhir juga dihitung server saat submit.
    const check = async (q, answer) => (await axios.post('/amr-challenge/periksa', { question_id: q.id, answer })).data;

    const finish = (answers) => {
        setFinishing(true);
        setError(null);
        router.post('/amr-challenge', { answers }, {
            onError: (e) => setError(Object.values(e)[0] || 'Hasil belum dapat disimpan. Coba lagi.'),
            onFinish: () => setFinishing(false),
        });
    };

    return (
        <AbxLayout>
            <Head title="AMR Challenge" />
            <PageContainer className="max-w-3xl">
                <SectionHeader as="h1" eyebrow="AMR Challenge" title="Seberapa Bijak Kamu Menggunakan Antibiotik?" subtitle="Uji pengetahuanmu dalam 5 pertanyaan!" />

                {!playing ? (
                    <Card className="text-center sm:p-10">
                        <p className="text-5xl" aria-hidden="true">🎯</p>
                        {questions.length === 0 ? (
                            <p className="mt-4 text-gray-700">Belum ada pertanyaan challenge. Jalankan seeder terlebih dahulu.</p>
                        ) : (
                            <>
                                <p className="mt-4 text-gray-700">{questions.length} pernyataan: pilih MITOS atau FAKTA.</p>
                                {summary.best ? (
                                    <p className="mt-2 font-semibold text-teal-900">Skor terbaikmu: {summary.best.score}/{summary.best.total} · {summary.attempts}× percobaan</p>
                                ) : (
                                    <p className="mt-2 text-sm text-gray-600">Kamu belum pernah mencoba challenge ini.</p>
                                )}
                                <Button className="mt-6" onClick={() => setPlaying(true)}>{summary.attempts > 0 ? 'Coba Lagi' : 'Start Challenge'}</Button>
                                {summary.lastAttemptId && <p className="mt-4"><Button href={`/amr-challenge/hasil/${summary.lastAttemptId}`} variant="ghost">Lihat hasil terakhir</Button></p>}
                            </>
                        )}
                    </Card>
                ) : (
                    <>
                        <QuizPlayer questions={questions} check={check} onFinish={finish} finishing={finishing} />
                        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-rose-900">{error}</p>}
                    </>
                )}
                <Disclaimer className="mt-10" />
            </PageContainer>
        </AbxLayout>
    );
}
