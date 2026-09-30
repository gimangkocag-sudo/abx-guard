/** Grafik batang vertikal sederhana (tanpa dependency). data: [{label, value}]; max opsional (mis. 5 untuk skala 1–5). */
export default function BarChart({ data, max, unit = '', label }) {
    const top = max ?? Math.max(1, ...data.map((d) => d.value));
    return (
        <figure>
            <div role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${d.value}${unit}`).join(', ')}`} className="flex h-48 items-end gap-2 border-b border-slate-300 px-1">
                {data.map((d) => (
                    <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end">
                        <span className="mb-1 text-xs font-semibold text-slate-800">{d.value}{unit}</span>
                        <div className="w-full max-w-12 rounded-t-md bg-teal-500" style={{ height: `${(d.value / top) * 82}%`, minHeight: d.value > 0 ? 4 : 0 }} />
                    </div>
                ))}
            </div>
            <div className="mt-1 flex gap-2 px-1" aria-hidden="true">
                {data.map((d) => <span key={d.label} className="flex-1 break-words text-center text-xs text-slate-600">{d.label}</span>)}
            </div>
        </figure>
    );
}
