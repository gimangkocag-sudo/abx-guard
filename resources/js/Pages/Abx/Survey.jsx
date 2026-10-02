import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';

function loadDraft(key, sections) {
    try {
        const stored = JSON.parse(sessionStorage.getItem(key));
        if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};

        const allowed = new Map(sections.flatMap((section) => section.questions.map((q) => [String(q.id), new Set(section.options.map((o) => o.value))])));
        return Object.fromEntries(Object.entries(stored).filter(([id, value]) => allowed.get(id)?.has(value)));
    } catch {
        return {};
    }
}

function buildSteps(sections) {
    return sections.flatMap((section, sectionIndex) => {
        if (section.key !== 'acceptance') return [{ section, sectionIndex, questions: section.questions, title: section.title }];

        const groups = new Map();
        section.questions.forEach((question) => {
            const group = question.group || section.title;
            groups.set(group, [...(groups.get(group) || []), question]);
        });
        return [...groups].map(([title, questions]) => ({ section, sectionIndex, questions, title }));
    });
}

export default function Survey({ auth, survey, submittedAt }) {
    const sections = survey?.sections ?? [];
    const steps = useMemo(() => buildSteps(sections), [sections]);
    const draftKey = `abx_kap_answers_${auth?.user?.id ?? 'guest'}_${survey?.version ?? 'unknown'}`;
    const reviewStep = steps.length;
    const [step, setStep] = useState(0);
    const [draft, setDraft] = useState(() => ({ key: draftKey, answers: loadDraft(draftKey, sections) }));
    const answers = draft.key === draftKey ? draft.answers : loadDraft(draftKey, sections);
    const [showErrors, setShowErrors] = useState(false);
    const [serverError, setServerError] = useState(null);
    const [sending, setSending] = useState(false);
    const sendingRef = useRef(false);
    const headingRef = useRef(null);
    const questionRefs = useRef({});

    useEffect(() => {
        if (draft.key !== draftKey) setDraft({ key: draftKey, answers: loadDraft(draftKey, sections) });
        setStep(0);
    }, [draftKey]);

    useEffect(() => {
        if (draft.key !== draftKey) return;
        try {
            sessionStorage.setItem(draftKey, JSON.stringify(answers));
        } catch { /* storage tidak tersedia: jawaban tetap di memori */ }
    }, [answers, draft.key, draftKey]);

    const setAnswers = (update) => setDraft((previous) => {
        const currentAnswers = previous.key === draftKey ? previous.answers : loadDraft(draftKey, sections);
        return { key: draftKey, answers: typeof update === 'function' ? update(currentAnswers) : update };
    });

    useEffect(() => {
        headingRef.current?.focus({ preventScroll: true });
        headingRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }, [step]);

    const missing = (current) => current.questions.filter((q) => !current.section.options.some((o) => o.value === answers[q.id]));
    const current = steps[step];
    const isReview = step >= reviewStep;
    const missingCurrent = current ? missing(current) : [];
    const totalQuestions = sections.reduce((total, section) => total + section.questions.length, 0);
    const answeredCount = sections.reduce((total, section) => total + section.questions.filter((q) => section.options.some((o) => o.value === answers[q.id])).length, 0);
    const progress = Math.round(((step + 1) / Math.max(1, steps.length + 1)) * 100);

    const next = () => {
        if (current && missingCurrent.length) {
            setShowErrors(true);
            const first = missingCurrent[0];
            requestAnimationFrame(() => {
                questionRefs.current[first.id]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                questionRefs.current[first.id]?.focus({ preventScroll: true });
            });
            return;
        }
        setShowErrors(false);
        setStep((value) => Math.min(value + 1, reviewStep));
    };

    const back = () => {
        setShowErrors(false);
        setStep((value) => Math.max(value - 1, 0));
    };

    const submit = () => {
        if (sendingRef.current || answeredCount !== totalQuestions) return;
        sendingRef.current = true;
        setSending(true);
        setServerError(null);
        router.post('/kap-survey', { answers }, {
            onSuccess: () => {
                try { sessionStorage.removeItem(draftKey); } catch { /* storage tidak tersedia */ }
            },
            onError: (errors) => setServerError(Object.values(errors)[0] || 'Survey belum dapat dikirim.'),
            onHttpException: (response) => setServerError(response.status === 419 ? 'Sesi berakhir. Muat ulang halaman sebelum mengirim kembali.' : 'Survey belum dapat dikirim. Coba lagi.'),
            onNetworkError: () => setServerError('Koneksi terputus. Periksa koneksi lalu coba lagi.'),
            onFinish: () => { sendingRef.current = false; setSending(false); },
        });
    };

    const labelFor = useMemo(() => {
        const map = {};
        sections.forEach((section) => section.questions.forEach((q) => {
            map[q.id] = Object.fromEntries(section.options.map((option) => [option.value, option.label]));
        }));
        return map;
    }, [sections]);

    if (submittedAt) {
        return (
            <AbxLayout>
                <Head title="Survei KAP" />
                <div className="mx-auto max-w-2xl p-4 sm:p-6">
                    <div role="status" className="rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center sm:p-8">
                        <h1 className="text-2xl font-semibold text-teal-900">Survei sudah diisi</h1>
                        <p className="mt-3 text-teal-800">Terima kasih telah mengisi KAP Survey ABX Guard.</p>
                        <p className="mt-1 text-sm text-teal-700">{new Date(submittedAt).toLocaleString('id-ID', { timeZone: 'UTC' })} UTC</p>
                    </div>
                </div>
            </AbxLayout>
        );
    }

    return (
        <AbxLayout>
            <Head title="Survei KAP" />
            <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
                <h1 className="mb-2 text-2xl font-bold text-teal-950">{survey?.title ?? 'Survei KAP'}</h1>
                {!survey || sections.length === 0 ? (
                    <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">Survei belum tersedia. Silakan coba kembali nanti.</div>
                ) : (
                    <>
                        <p className="mb-4 text-sm leading-6 text-gray-600">{survey.description}</p>

                        <aside className="mb-6 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950" aria-labelledby="privacy-heading">
                            <h2 id="privacy-heading" className="font-semibold">Informasi jawaban survei</h2>
                            <p className="mt-1">Tujuan survei adalah memahami pengetahuan, sikap, praktik, dan penerimaan pengguna terhadap edukasi antibiotik, AMR, dan mikrobioma. Jawaban terhubung dengan akun Anda dan dapat dilihat oleh admin ABX GUARD yang berwenang.</p>
                            <p className="mt-1">Masa penyimpanan jawaban: <strong>belum ditetapkan oleh pemilik produk.</strong></p>
                        </aside>

                        <div className="mb-6 rounded-xl bg-teal-50 p-4" aria-label="Progres survei">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-1 text-sm font-medium text-teal-950">
                                <span>Langkah {step + 1} dari {steps.length + 1}: {current ? current.title : 'Tinjau jawaban'}</span>
                                <span>{answeredCount} dari {totalQuestions} item dijawab</span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-teal-100" role="progressbar" aria-label="Progres langkah survei" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                                <div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="mt-2 text-xs text-teal-800">{steps.length - step} langkah survei tersisa sebelum tinjauan jawaban.</p>
                        </div>

                        {!isReview ? (
                            <section aria-labelledby="survey-step-heading">
                                <h2 ref={headingRef} id="survey-step-heading" tabIndex={-1} className="mb-4 scroll-mt-24 rounded-sm text-lg font-semibold text-teal-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">{current.title}</h2>
                                {current.section.instruction && <p className="mb-4 text-gray-700">{current.section.instruction}</p>}

                                {showErrors && missingCurrent.length > 0 && (
                                    <div role="alert" className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
                                        <p className="font-semibold">Masih ada {missingCurrent.length} pertanyaan yang perlu dijawab pada bagian ini.</p>
                                        <p className="mt-1">Fokus telah dipindahkan ke pertanyaan pertama yang belum dijawab.</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {current.questions.map((q) => {
                                        const questionNumber = current.section.questions.findIndex((item) => item.id === q.id) + 1;
                                        const err = showErrors && !current.section.options.some((option) => option.value === answers[q.id]);
                                        const errorId = `question-${q.id}-error`;
                                        return (
                                            <fieldset key={q.id} className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${err ? 'border-red-500' : 'border-gray-200'}`}>
                                                <legend className="max-w-full px-1 font-medium leading-6 text-gray-900">{questionNumber}. {q.text}</legend>
                                                <div className="mt-2 grid gap-2">
                                                    {current.section.options.map((option, optionIndex) => {
                                                        const inputId = `question-${q.id}-option-${optionIndex}`;
                                                        return (
                                                            <label key={option.value} htmlFor={inputId} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 focus-within:ring-2 focus-within:ring-teal-600 ${answers[q.id] === option.value ? 'border-teal-700 bg-teal-50' : 'border-gray-200'}`}>
                                                                <input ref={optionIndex === 0 ? (node) => { questionRefs.current[q.id] = node; } : undefined} id={inputId} type="radio" className="h-5 w-5 flex-none text-teal-700 focus:ring-teal-600" name={`q-${q.id}`} value={option.value} checked={answers[q.id] === option.value} aria-invalid={err || undefined} aria-describedby={err ? errorId : undefined} onChange={() => setAnswers((previous) => ({ ...previous, [q.id]: option.value }))} />
                                                                <span>{option.label}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                                {err && <p id={errorId} className="mt-2 text-sm font-medium text-red-700">Pertanyaan ini wajib dijawab.</p>}
                                            </fieldset>
                                        );
                                    })}
                                </div>
                            </section>
                        ) : (
                            <section aria-labelledby="survey-review-heading">
                                <h2 ref={headingRef} id="survey-review-heading" tabIndex={-1} className="mb-4 scroll-mt-24 rounded-sm text-lg font-semibold text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Tinjau jawabanmu</h2>
                                {sections.map((section, sectionIndex) => (
                                    <div key={section.key} className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <h3 className="font-semibold text-teal-900">{section.title}</h3>
                                            <button type="button" onClick={() => setStep(steps.findIndex((item) => item.sectionIndex === sectionIndex))} className="min-h-11 rounded-md px-3 text-sm font-medium text-teal-800 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Ubah</button>
                                        </div>
                                        <ol className="space-y-2 break-words text-sm text-gray-700">
                                            {section.questions.map((q, index) => (
                                                <li key={q.id}>{index + 1}. {q.text} <strong className="text-teal-900">— {labelFor[q.id]?.[answers[q.id]] ?? 'Belum dijawab'}</strong></li>
                                            ))}
                                        </ol>
                                    </div>
                                ))}
                                {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-900">{serverError}</p>}
                            </section>
                        )}

                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                            <button type="button" onClick={back} disabled={step === 0 || sending} className="min-h-11 rounded-xl border border-gray-300 px-6 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-40">Kembali</button>
                            {!isReview ? (
                                <button type="button" onClick={next} disabled={sending} className="min-h-11 rounded-xl bg-teal-700 px-6 font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">Lanjut</button>
                            ) : (
                                <button type="button" onClick={submit} disabled={sending || answeredCount !== totalQuestions} aria-busy={sending} className="min-h-11 rounded-xl bg-teal-700 px-6 font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    {sending ? 'Mengirim…' : 'Kirim Survei'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AbxLayout>
    );
}
