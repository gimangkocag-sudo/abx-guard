import { useState } from 'react';
import Button from './Button';
import FadeIn from './FadeIn';
import ProgressBar from './ProgressBar';
import QuizOption from './QuizOption';

const CHOICES = [{ value: 'mitos', label: 'MITOS' }, { value: 'fakta', label: 'FAKTA' }];

/**
 * Pemutar kuis Mitos/Fakta yang dipakai Myth or Fact dan AMR Challenge.
 * check(question, answer) -> Promise<{correct, correct_answer, explanation}> (sumber kebenaran ada di pemanggil).
 * onFinish(answers) dipanggil setelah pertanyaan terakhir.
 */
export default function QuizPlayer({ questions, check, onFinish, finishing = false, finishLabel = 'Lihat Hasil' }) {
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const q = questions[index];
    const last = index === questions.length - 1;

    const choose = async (value) => {
        if (feedback || loading) return;
        setSelected(value);
        setLoading(true);
        setError(null);
        try {
            const result = await check(q, value);
            setFeedback(result);
            setAnswers((a) => ({ ...a, [q.id]: value }));
        } catch {
            setSelected(null);
            setError('Jawaban belum dapat diperiksa. Periksa koneksi lalu coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const next = () => {
        if (last) return onFinish(answers);
        setIndex(index + 1);
        setSelected(null);
        setFeedback(null);
    };

    const stateOf = (value) => {
        if (!feedback) return selected === value ? 'selected' : 'idle';
        if (value === feedback.correct_answer) return 'correct';
        return value === selected ? 'wrong' : 'idle';
    };

    return (
        <div>
            <div className="mb-2 flex justify-between text-sm font-semibold text-teal-900">
                <span>Pertanyaan {index + 1}/{questions.length}</span>
                <span>{Math.round((index / questions.length) * 100)}%</span>
            </div>
            <ProgressBar value={index} max={questions.length} label="Progres pertanyaan" />

            <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
                <p id="quiz-q" className="text-xl font-semibold text-teal-950">“{q.statement}”</p>
                <div role="radiogroup" aria-labelledby="quiz-q" className="mt-5 grid gap-3 sm:grid-cols-2">
                    {CHOICES.map((c) => (
                        <QuizOption key={c.value} label={c.label} state={stateOf(c.value)} disabled={Boolean(feedback) || loading} onSelect={() => choose(c.value)} />
                    ))}
                </div>
                {loading && <p role="status" className="mt-4 text-sm text-gray-600">Memeriksa jawaban…</p>}
                {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-rose-900">{error}</p>}
                <div aria-live="polite">
                    {feedback && (
                        <FadeIn className="mt-5">
                            <div className={`rounded-xl border-l-4 p-4 ${feedback.correct ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-rose-500 bg-rose-50 text-rose-950'}`}>
                                <p className="font-bold">{feedback.correct ? '✓ Jawabanmu benar' : '✗ Jawabanmu belum tepat'} — jawaban: {feedback.correct_answer.toUpperCase()}</p>
                                <p className="mt-1">{feedback.explanation}</p>
                            </div>
                        </FadeIn>
                    )}
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <Button onClick={next} disabled={!feedback || finishing}>{finishing ? 'Menyimpan…' : last ? finishLabel : 'Lanjut'}</Button>
            </div>
        </div>
    );
}
