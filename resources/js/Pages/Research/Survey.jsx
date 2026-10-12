import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import { navigateSurveySection, syncSurveyStage } from '@/lib/surveyNavigation';

function Question({ item, value, onChange, notApplicable, onNotApplicable, error, disabled }) {
    const options = item.options ?? [];
    const checkable = ['multiple_choice', 'multiple_choice_exclusive'].includes(item.type);
    const selected = Array.isArray(value) ? value : [];
    const errorId = `${item.code}-error`;
    const inputClass = 'h-4 w-4 border-slate-300 text-teal-700 focus:ring-teal-600';
    const labelClass = 'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-5 text-slate-800 transition-colors hover:border-teal-300 hover:bg-teal-50 focus-within:ring-2 focus-within:ring-teal-600';
    const setAnswer = (next) => { onNotApplicable(false); onChange(next); };

    return <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-describedby={error ? errorId : undefined}>
        <legend className="sr-only">{item.prompt}</legend>
        <p className="font-medium leading-6 text-teal-950">{item.prompt}{item.required && <span className="ml-1 text-rose-700" aria-label="wajib diisi">*</span>}</p>
        {item.type === 'short_text' && <input type="text" maxLength="160" autoComplete="off" value={value ?? ''} disabled={disabled} onChange={(event) => setAnswer(event.target.value)} className="mt-3 min-h-11 w-full rounded-xl border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-teal-600 disabled:bg-slate-100" aria-label={item.prompt} />}
        {item.type === 'integer' && <input type="number" min="1" max="120" inputMode="numeric" value={value ?? ''} disabled={disabled} onChange={(event) => setAnswer(event.target.value)} className="mt-3 min-h-11 w-full rounded-xl border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-teal-600 disabled:bg-slate-100 sm:max-w-40" aria-label={item.prompt} />}
        {item.type === 'long_text' && <textarea rows="4" maxLength="5000" value={value ?? ''} disabled={disabled} onChange={(event) => setAnswer(event.target.value)} className="mt-3 min-h-32 w-full resize-y rounded-xl border-slate-300 text-base leading-6 text-slate-900 focus:border-teal-600 focus:ring-teal-600 disabled:bg-slate-100" aria-label={item.prompt} />}
        {['single_choice', 'likert', 'true_false_unknown'].includes(item.type) && <div className={`mt-3 grid gap-2 ${item.type === 'likert' ? 'sm:grid-cols-5' : 'sm:grid-cols-2'}`}>
            {options.map((option) => <label key={option.value} className={`${labelClass} ${value === option.value ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-300' : ''}`}>
                <input className={`${inputClass} mt-0.5 flex-none`} type="radio" name={item.code} value={option.value} checked={String(value ?? '') === String(option.value)} disabled={disabled} onChange={() => setAnswer(String(option.value))} aria-describedby={error ? errorId : undefined} />
                <span>{option.label}</span>
            </label>)}
        </div>}
        {checkable && <>
            <p className="mt-2 text-xs text-slate-600">{item.type === 'multiple_choice' ? 'Pilih maksimal dua.' : 'Kamu dapat memilih beberapa sumber. “Tidak tahu / Tidak pernah” berdiri sendiri.'}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {options.map((option) => {
                    const checked = selected.includes(option.value);
                    const atLimit = item.type === 'multiple_choice' && selected.length >= 2 && !checked;
                    return <label key={option.value} className={`${labelClass} ${checked ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-300' : ''} ${atLimit || disabled ? 'cursor-not-allowed opacity-60' : ''}`}>
                        <input className={`${inputClass} mt-0.5 flex-none`} type="checkbox" value={option.value} checked={checked} disabled={disabled || atLimit} onChange={() => {
                            if (checked) setAnswer(selected.filter((entry) => entry !== option.value));
                            else setAnswer([...selected, option.value]);
                        }} aria-describedby={error ? errorId : undefined} />
                        <span>{option.label}</span>
                    </label>;
                })}
            </div>
        </>}
        {['E02', 'E06'].includes(item.code) && <label className="mt-3 flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-700">
            <input type="checkbox" className={`${inputClass} mt-0.5 flex-none`} checked={notApplicable} disabled={disabled} onChange={(event) => onNotApplicable(event.target.checked)} />
            <span>{item.code === 'E02' ? 'Tandai tidak berlaku jika Anda belum pernah menggunakan antibiotik.' : 'Tandai tidak berlaku jika Anda belum pernah memiliki sisa antibiotik di rumah.'}</span>
        </label>}
        {error && <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-rose-800">{error}</p>}
        {item.type === 'long_text' && <p className="mt-2 text-xs text-slate-500">Opsional · maksimal 5.000 karakter.</p>}
    </fieldset>;
}

export default function ResearchSurvey({ instrument, stage, sections = [], itemCount = 0, submission, answers = {}, notApplicable = [], evaluationAvailable = false, blockedStage = false }) {
    const page = usePage();
    const [stepState, setStepState] = useState({ stage, index: 0 });
    const step = stepState.stage === stage ? stepState.index : 0;
    const setStep = (index) => setStepState({ stage, index });
    const form = useForm({ answers, notApplicable });
    const formStageRef = useRef(stage);
    // Initial and evaluation have different section counts. If Inertia reuses
    // this component when the stage changes, don't carry an invalid step over.
    const safeStep = Math.min(step, Math.max(0, sections.length - 1));
    const sectionNavigationRef = useRef(null);
    const previousNavigationRef = useRef({ stage, index: 0 });
    useEffect(() => {
        if (step !== safeStep) setStep(safeStep);
    }, [step, safeStep]);
    useEffect(() => {
        if (syncSurveyStage(stage, formStageRef.current, answers, notApplicable, form.setData, form.clearErrors)) {
            formStageRef.current = stage;
        }
    }, [stage, answers, notApplicable]);
    useEffect(() => {
        const previous = previousNavigationRef.current;
        if (previous.stage !== stage) {
            // Inertia may preserve the previous page's scroll position when
            // switching from A–E to F–H. Run after the page swap so the sticky
            // navbar cannot cover the evaluation heading.
            const frame = window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
            previousNavigationRef.current = { stage, index: safeStep };
            return () => window.cancelAnimationFrame(frame);
        }
        if (previous.index !== safeStep) {
            const frame = window.requestAnimationFrame(() => sectionNavigationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
            previousNavigationRef.current = { stage, index: safeStep };
            return () => window.cancelAnimationFrame(frame);
        }
    }, [stage, safeStep]);
    const current = sections[safeStep];
    const submitted = submission?.status === 'submitted';
    const doneItems = useMemo(() => sections.flatMap((section) => section.items).filter((item) => {
        const value = form.data.answers[item.code];
        return (Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== '') || form.data.notApplicable.includes(item.code);
    }).length, [sections, form.data.answers, form.data.notApplicable]);
    const stageLabel = stage === 'initial' ? 'Tahap awal · Bagian A–E' : 'Evaluasi setelah pemaparan · Bagian F–H';

    const saveDraft = () => {
        form.clearErrors();
        form.post(`/survei-penelitian/${stage}/draft`, {
            preserveScroll: true,
            onSuccess: () => form.clearErrors(),
            onError: (errors) => {
                const firstInvalid = Object.keys(errors).find((key) => key.startsWith('answers.'))?.slice('answers.'.length);
                const invalidStep = sections.findIndex((section) => section.items.some((item) => item.code === firstInvalid));
                if (invalidStep >= 0) setStep(invalidStep);
            },
            onNetworkError: () => form.setError('stage', 'Koneksi terputus. Jawaban yang sudah disimpan tetap aman; coba simpan kembali saat tersambung.'),
            onHttpException: () => form.setError('stage', 'Draft belum tersimpan. Coba lagi atau hubungi admin platform.'),
        });
    };
    const navigateAndSave = (index) => navigateSurveySection(index, sections.length, setStep, saveDraft);
    const submit = () => form.post(`/survei-penelitian/${stage}/submit`, {
        preserveScroll: true,
        onError: (errors) => {
            const firstInvalid = Object.keys(errors).find((key) => key.startsWith('answers.'))?.slice('answers.'.length);
            const invalidStep = sections.findIndex((section) => section.items.some((item) => item.code === firstInvalid));
            if (invalidStep >= 0) setStep(invalidStep);
        },
        onNetworkError: () => form.setError('stage', 'Koneksi terputus. Coba kirim kembali saat tersambung.'),
        onHttpException: () => form.setError('stage', 'Jawaban belum berhasil dikirim. Coba kembali atau hubungi admin platform.'),
    });
    const setNotApplicable = (code, checked) => {
        const currentCodes = form.data.notApplicable;
        form.setData({
            answers: { ...form.data.answers, [code]: checked ? null : form.data.answers[code] },
            notApplicable: checked ? [...new Set([...currentCodes, code])] : currentCodes.filter((entry) => entry !== code),
        });
    };

    return <AbxLayout>
        <Head title="Survei Penelitian ABX Guard" />
        <PageContainer className="max-w-4xl">
            <header className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Instrumen penelitian · Versi {instrument.version}</p>
                <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-teal-950 sm:text-3xl">{instrument.title}</h1>
                <p className="mt-3 rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm leading-6 text-teal-950">Survei ini mengumpulkan jawaban untuk penelitian. Nama/inisial diminta dan jawaban terhubung dengan akun yang digunakan untuk masuk, sehingga survei ini tidak anonim. Data dapat dilihat oleh admin platform yang berwenang.</p>
            </header>

            {blockedStage && <div role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Tahap awal perlu dikirim sebelum evaluasi platform dapat dibuka. Jika sudah mendapat pemaparan atau mencoba platform, lanjutkan evaluasi setelah tahap awal selesai.</div>}
            {page.props.flash?.success && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{page.props.flash.success}</p>}
            {page.props.flash?.draftSaved && <p role="status" className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">Draft tersimpan di database dan dapat dilanjutkan nanti.</p>}
            {form.errors.stage && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{form.errors.stage}</p>}

            <section ref={sectionNavigationRef} className="mt-6 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="stage-heading">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><p className="text-sm font-semibold text-teal-800">{stageLabel}</p><h2 id="stage-heading" className="mt-1 text-xl font-bold text-teal-950">{submitted ? 'Jawaban tahap ini tersimpan' : current?.title}</h2></div>
                    {submitted && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Terkirim</span>}
                </div>
                {!submitted && <>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{current?.instruction}</p>
                    <div className="mt-4 flex items-center justify-between gap-3 text-xs font-medium text-slate-600"><span>Bagian {current?.key ?? '—'} · {safeStep + 1} dari {sections.length}</span><span>{doneItems} dari {itemCount} item terisi</span></div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Progres pengisian survei" aria-valuemin="0" aria-valuemax={sections.length} aria-valuenow={safeStep + 1}>
                        <div className="h-full rounded-full bg-teal-700 transition-[width]" style={{ width: `${sections.length ? ((safeStep + 1) / sections.length) * 100 : 0}%` }} />
                    </div>
                    <ol className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8" aria-label="Bagian survei">
                        {sections.map((section, index) => <li key={section.key}><button type="button" onClick={() => index === safeStep ? null : navigateAndSave(index)} disabled={form.processing} aria-current={index === safeStep ? 'step' : undefined} className={`flex min-h-11 w-full items-center justify-center rounded-lg text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${index === safeStep ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-teal-50'}`}>{section.key}</button></li>)}
                    </ol>
                    {form.errors.stage && <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{form.errors.stage}</p>}
                </>}
            </section>

            {submitted ? <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><p className="text-sm text-slate-700">Jawaban tersimpan{submission.submittedAt ? ` pada ${new Date(submission.submittedAt).toLocaleString('id-ID')}` : ''}. Jawaban tahap terkirim tidak dapat diedit.</p>{stage === 'initial' && evaluationAvailable && <Link href="/survei-penelitian?stage=evaluation" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">Buka evaluasi platform</Link>}{stage === 'initial' && !evaluationAvailable && <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50 p-4"><p className="text-sm leading-6 text-teal-950">Bagian evaluasi diisi setelah kamu mendapat pemaparan atau mencoba platform. Konfirmasi berikut hanya mencatat pernyataanmu; sistem tidak memverifikasi paparan.</p><button type="button" onClick={() => router.post('/survei-penelitian/evaluation/unlock')} className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">Saya sudah mendapat pemaparan atau mencoba platform</button></div>}</section> : <>
                <div className="mt-4 space-y-3">
                    {current?.items.map((item) => <Question key={item.code} item={item} value={form.data.answers[item.code]} onChange={(value) => form.setData('answers', { ...form.data.answers, [item.code]: value })} notApplicable={form.data.notApplicable.includes(item.code)} onNotApplicable={(checked) => setNotApplicable(item.code, checked)} error={form.errors[`answers.${item.code}`]} disabled={form.processing || item.code === 'E02' && form.data.answers.E01 === 'belum_pernah'} />)}
                </div>
                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={() => setStep(Math.max(0, safeStep - 1))} disabled={safeStep === 0 || form.processing} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-teal-900 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-50">Kembali</button>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button type="button" onClick={saveDraft} disabled={form.processing} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-teal-900 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:opacity-50">{form.processing ? 'Menyimpan…' : 'Simpan draft'}</button>
                        {safeStep < sections.length - 1 ? <button type="button" onClick={() => navigateAndSave(safeStep + 1)} disabled={form.processing} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-50">{form.processing ? 'Menyimpan…' : 'Simpan dan lanjut'}</button> : <button type="button" onClick={submit} disabled={form.processing} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-50">{form.processing ? 'Mengirim…' : 'Kirim tahap ini'}</button>}
                    </div>
                </div>
            </>}
        </PageContainer>
    </AbxLayout>;
}
