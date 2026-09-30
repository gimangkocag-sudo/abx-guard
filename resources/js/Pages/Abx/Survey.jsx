import { useEffect, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';

// Draft dipisah per user dan per versi survey, agar tidak bocor antar akun di browser yang sama.
function loadDraft(key) {
    try {
        const value = JSON.parse(sessionStorage.getItem(key));
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch {
        return {};
    }
}

export default function Survey({ auth, survey, submittedAt }) {
    const sections = survey.sections;
    const draftKey = `abx_kap_answers_${auth.user.id}_${survey.version}`;
    const reviewStep = sections.length; // step terakhir = Review
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState(() => loadDraft(draftKey));
    const [showErrors, setShowErrors] = useState(false);
    const [serverError, setServerError] = useState(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        try {
            sessionStorage.setItem(draftKey, JSON.stringify(answers));
        } catch { /* storage tidak tersedia: jawaban tetap di memori */ }
    }, [answers, draftKey]);

    const missing = (section) => section.questions.filter((q) => !answers[q.id]);
    const progress = Math.round(((step + 1) / (sections.length + 1)) * 100);

    const next = () => {
        if (step < sections.length && missing(sections[step]).length) return setShowErrors(true);
        setShowErrors(false);
        setStep(step + 1);
        window.scrollTo({ top: 0 });
    };
    const back = () => { setShowErrors(false); setStep(step - 1); window.scrollTo({ top: 0 }); };

    const submit = () => {
        setSending(true);
        setServerError(null);
        router.post('/kap-survey', { answers }, {
            onSuccess: () => { try { sessionStorage.removeItem(draftKey); } catch {} },
            onError: (e) => setServerError(Object.values(e)[0] || 'Survey belum dapat dikirim.'),
            onFinish: () => setSending(false),
        });
    };

    const labelFor = useMemo(() => {
        const map = {};
        sections.forEach((s) => s.questions.forEach((q) => { map[q.id] = Object.fromEntries(s.options.map((o) => [o.value, o.label])); }));
        return map;
    }, [sections]);

    if (submittedAt) {
        return (
            <AbxLayout>
                <Head title="KAP Survey" />
                <div className="mx-auto max-w-2xl p-6">
                    <div role="status" className="rounded-2xl border border-teal-200 bg-teal-50 p-8 text-center">
                        <h1 className="text-2xl font-semibold text-teal-900">Survey Sudah Diisi</h1>
                        <p className="mt-3 text-teal-800">Terima kasih telah mengisi KAP Survey ABX Guard.</p>
                        <p className="mt-1 text-sm text-teal-700">{new Date(submittedAt).toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </AbxLayout>
        );
    }

    const section = sections[step];

    return (
        <AbxLayout>
            <Head title="KAP Survey" />
            <div className="mx-auto max-w-2xl px-4 py-6">
                <h1 className="mb-2 text-2xl font-bold text-teal-950">{survey.title}</h1>
                <p className="mb-4 text-sm text-gray-600">{survey.description}</p>

                <div className="mb-6" aria-live="polite">
                    <div className="mb-1 flex justify-between text-sm font-medium text-teal-900">
                        <span>Langkah {step + 1} dari {sections.length + 1}: {section ? section.title : 'Review'}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-teal-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                        <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {section ? (
                    <div className="space-y-6">
                        {section.instruction && <p className="text-gray-700">{section.instruction}</p>}
                        {section.questions.map((q, i) => {
                            const prev = section.questions[i - 1];
                            const err = showErrors && !answers[q.id];
                            return (
                                <div key={q.id}>
                                    {q.group && (!prev || prev.group !== q.group) && (
                                        <h3 className="mb-2 mt-4 text-sm font-semibold uppercase tracking-wide text-teal-700">{q.group}</h3>
                                    )}
                                    <fieldset className={`rounded-2xl border bg-white p-4 shadow-sm ${err ? 'border-red-500' : 'border-gray-200'}`}>
                                        <legend className="px-1 font-medium text-gray-900">{i + 1}. {q.text}</legend>
                                        <div className="mt-2 grid gap-2">
                                            {section.options.map((o) => (
                                                <label key={o.value} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 focus-within:ring-2 focus-within:ring-teal-500 ${answers[q.id] === o.value ? 'border-teal-600 bg-teal-50' : 'border-gray-200'}`}>
                                                    <input type="radio" className="h-5 w-5 text-teal-600" name={`q-${q.id}`} value={o.value}
                                                        checked={answers[q.id] === o.value}
                                                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.value }))} />
                                                    <span>{o.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {err && <p role="alert" className="mt-2 text-sm font-medium text-red-700">Pertanyaan ini wajib dijawab.</p>}
                                    </fieldset>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Review jawabanmu</h3>
                        {sections.map((s, si) => (
                            <div key={s.key} className="rounded-2xl border border-gray-200 bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h4 className="font-semibold text-teal-900">{s.title}</h4>
                                    <button type="button" onClick={() => setStep(si)} className="min-h-10 px-3 text-sm font-medium text-teal-700 underline">Ubah</button>
                                </div>
                                <ol className="space-y-1 text-sm text-gray-700">
                                    {s.questions.map((q, i) => (
                                        <li key={q.id}>{i + 1}. {q.text} <strong className="text-teal-800">— {labelFor[q.id][answers[q.id]] ?? 'Belum dijawab'}</strong></li>
                                    ))}
                                </ol>
                            </div>
                        ))}
                        {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{serverError}</p>}
                    </div>
                )}

                <div className="mt-8 flex justify-between gap-3">
                    <button type="button" onClick={back} disabled={step === 0}
                        className="min-h-12 rounded-xl border border-gray-300 px-6 font-medium disabled:opacity-40">Kembali</button>
                    {step < reviewStep ? (
                        <button type="button" onClick={next} className="min-h-12 rounded-xl bg-teal-600 px-6 font-semibold text-white hover:bg-teal-700">Lanjut</button>
                    ) : (
                        <button type="button" onClick={submit} disabled={sending || sections.some((s) => missing(s).length)}
                            className="min-h-12 rounded-xl bg-teal-600 px-6 font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
                            {sending ? 'Mengirim…' : 'Kirim Survey'}
                        </button>
                    )}
                </div>
            </div>
        </AbxLayout>
    );
}
