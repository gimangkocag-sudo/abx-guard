import { useState } from 'react';
import { router } from '@inertiajs/react';

/** fields: [{name, label, type: 'text'|'date'|'select', options?: [{value,label}], placeholder?}] */
export default function FilterBar({ action, values, fields, children }) {
    const [v, setV] = useState(values);
    const [busy, setBusy] = useState(false);
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
                            <select id={`f-${f.name}`} className={input} value={v[f.name] ?? ''} onChange={(e) => setV({ ...v, [f.name]: e.target.value })}>
                                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        ) : (
                            <input id={`f-${f.name}`} type={f.type} placeholder={f.placeholder} className={input} value={v[f.name] ?? ''} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
                <button type="submit" disabled={busy} className="min-h-10 rounded-lg bg-teal-600 px-5 text-sm font-semibold text-white hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-60">{busy ? 'Memuat…' : 'Terapkan'}</button>
                <button type="button" onClick={reset} disabled={busy} className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">Reset</button>
                {children}
            </div>
        </form>
    );
}
