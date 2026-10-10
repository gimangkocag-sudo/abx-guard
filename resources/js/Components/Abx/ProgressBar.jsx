export default function ProgressBar({ value, max = 100, label, className = '' }) {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div className={className}>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/70" role="progressbar" aria-label={label} aria-valuenow={Math.min(value, max)} aria-valuemin={0} aria-valuemax={max} aria-valuetext={`${pct}%`}>
                <div className="h-full rounded-full bg-teal-700 motion-safe:transition-[width] motion-safe:duration-500" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
