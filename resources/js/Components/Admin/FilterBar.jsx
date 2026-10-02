import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

/** fields: [{name, label, type: 'text'|'date'|'select', options?: [{value,label}], placeholder?}] */
export default function FilterBar({ action, values, fields, children }) {
    const [v, setV] = useState(values);
    const [busy, setBusy] = useState(false);
    const { errors = {} } = usePage().props;
    useEffect(() => setV(values), [values]);
    const visit = (params) => router.get(action, params, { preserveState: true, replace: true, onStart: () => setBusy(true), onFinish: () => setBusy(false) });
    const submit = (e) => {
        e.preventDefault();
        visit(Object.fromEntries(Object.entries(v).filter(([, x]) => x !== '' && x != null)));
    };
    const reset = () => {
        setV(Object.fromEntries(fields.map((f) => [f.name, ''])));
        visit({});
    };
    const input = 'mt-1 block min-h-10 w-full rounded-lg border-slate-300 text-sm focus:border-teal-500 focus:ring-teal-500';
    return (
        <form onSubmit={submit} className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-busy={busy}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {fields.map((f) => (
                    <div key={f.name}>
                        <label htmlFor={`f-${f.name}`} className="text-sm font-medium text-slate-700">{f.label}</label>
                        {f.type === 'select' ? (
                            <select id={`f-${f.name}`} aria-invalid={Boolean(errors[f.name])} aria-describedby={errors[f.name] ? `f-${f.name}-error` : undefined} className={input} value={v[f.name] ?? ''} onChange={(e) => setV((previous) => ({ ...previous, [f.name]: e.target.value }))}>
                                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        ) : (
                            <input id={`f-${f.name}`} type={f.type} placeholder={f.placeholder} maxLength={f.type === 'text' ? (f.maxLength ?? (f.name === 'q' ? 100 : undefined)) : undefined} aria-invalid={Boolean(errors[f.name])} aria-describedby={errors[f.name] ? `f-${f.name}-error` : undefined} className={input} value={v[f.name] ?? ''} onChange={(e) => setV((previous) => ({ ...previous, [f.name]: e.target.value }))} />
                        )}
                        {errors[f.name] && <p id={`f-${f.name}-error`} role="alert" className="mt-1 text-sm text-rose-700">{errors[f.name]}</p>}
                    </div>
                ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
                <button type="submit" disabled={busy} className="min-h-11 rounded-lg bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-60">{busy ? 'Memuat…' : 'Terapkan'}</button>
                <button type="button" onClick={reset} disabled={busy} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-60">Reset</button>
                {children}
            </div>
        </form>
    );
}
