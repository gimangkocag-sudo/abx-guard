const PALETTES = {
    agreement: ['bg-rose-400', 'bg-amber-400', 'bg-slate-400', 'bg-teal-300', 'bg-teal-600'],
    gradient: ['bg-teal-100', 'bg-teal-300', 'bg-teal-500', 'bg-teal-700', 'bg-teal-900'],
    neutral: ['bg-teal-500', 'bg-indigo-400', 'bg-slate-400'],
};

/** Bar 100% bertumpuk + legenda berisi jumlah dan persen (status tidak hanya lewat warna). */
export default function DistributionBar({ items, responses, palette = 'neutral' }) {
    const colors = PALETTES[palette] ?? PALETTES.neutral;
    if (!responses) return <p className="text-sm text-slate-500">Belum ada jawaban.</p>;
    return (
        <div>
            <div role="img" aria-label={items.map((i) => `${i.label} ${i.count} (${i.percent}%)`).join(', ')} className="flex h-5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                {items.map((i, idx) => i.count > 0 && <div key={i.value} className={colors[idx % colors.length]} style={{ width: `${i.percent}%` }} />)}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
                {items.map((i, idx) => (
                    <li key={i.value} className="flex items-center gap-1">
                        <span aria-hidden="true" className={`inline-block h-3 w-3 rounded-sm ring-1 ring-slate-300 ${colors[idx % colors.length]}`} />
                        {i.label}: <strong>{i.count}</strong> ({i.percent}%)
                    </li>
                ))}
            </ul>
        </div>
    );
}
