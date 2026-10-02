import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import FadeIn from './FadeIn';
import ProgressBar from './ProgressBar';
import QuizOption from './QuizOption';

const CHOICES = [{ value: 'mitos', label: 'MITOS' }, { value: 'fakta', label: 'FAKTA' }];

/** Quiz dengan opsi radio native. check dapat ditunda sampai seluruh challenge selesai. */
export default function QuizPlayer({ questions, check, onFinish, finishing = false, finishLabel = 'Lihat Hasil', deferFeedback = false }) {
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const questionRef = useRef(null);

    const q = questions[index];
    const last = index === questions.length - 1;

    useEffect(() => {
        if (feedback && !feedback.deferred) document.getElementById('quiz-next')?.focus();
    }, [feedback]);

    useEffect(() => {
        questionRef.current?.focus({ preventScroll: true });
    }, [index]);

    const choose = async (value) => {
        if (feedback || loading) return;
        setSelected(value);
        setAnswers((previous) => ({ ...previous, [q.id]: value }));

        if (deferFeedback) {
            setFeedback({ deferred: true });
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await check(q, value);
            setFeedback(result);
        } catch {
            setSelected(null);
            setAnswers((previous) => {
                const next = { ...previous };
                delete next[q.id];
                return next;
            });
            setError('Jawaban belum dapat diperiksa. Periksa koneksi lalu coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const next = () => {
        if (last) return onFinish(answers);
        setIndex((value) => value + 1);
        setSelected(null);
        setFeedback(null);
    };

    const stateOf = (value) => {
        if (!feedback || feedback.deferred) return selected === value ? 'selected' : 'idle';
        if (value === feedback.correct_answer) return 'correct';
        return value === selected ? 'wrong' : 'idle';
    };

    return (
        <div>
            <p className="mb-2 text-sm font-semibold text-teal-900">Pertanyaan {index + 1} dari {questions.length}</p>
            <ProgressBar value={index + 1} max={questions.length} label="Progres pertanyaan" />

            <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm sm:p-6">
                <p ref={questionRef} tabIndex={-1} id="quiz-q" className="rounded-sm text-xl font-semibold text-teal-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">“{q.statement}”</p>
                <div role="radiogroup" aria-labelledby="quiz-q" className="mt-5 grid gap-3 sm:grid-cols-2">
                    {CHOICES.map((choice) => (
                        <QuizOption key={choice.value} label={choice.label} value={choice.value} selected={selected === choice.value} state={stateOf(choice.value)} disabled={Boolean(feedback) || loading} onSelect={() => choose(choice.value)} />
                    ))}
                </div>
                {loading && <p role="status" className="mt-4 text-sm text-gray-700">Memeriksa jawaban…</p>}
                {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-rose-950">{error}</p>}
                {feedback?.deferred && <p role="status" className="mt-4 text-sm text-gray-700">Jawaban tersimpan. Pembahasan akan ditampilkan setelah challenge selesai.</p>}
                {feedback && !feedback.deferred && (
                    <FadeIn className="mt-5">
                        <div role="status" aria-live="polite" className={`rounded-xl border-l-4 p-4 ${feedback.correct ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-rose-600 bg-rose-50 text-rose-950'}`}>
                            <p className="font-bold">{feedback.correct ? '✓ Jawabanmu benar' : '✗ Jawabanmu belum tepat'}{feedback.correct_answer ? ` — jawaban: ${feedback.correct_answer.toUpperCase()}` : ''}</p>
                            <p className="mt-1">{feedback.explanation}</p>
                        </div>
                    </FadeIn>
                )}
            </div>

            <div className="mt-6 flex justify-end">
                <Button id="quiz-next" onClick={next} disabled={!feedback || finishing}>{finishing ? 'Menyimpan…' : last ? finishLabel : 'Lanjut'}</Button>
            </div>
        </div>
    );
}
