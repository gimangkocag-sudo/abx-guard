export default function ProgressBar({ value, max = 100, label, className = '' }) {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div className={className}>
            <div className="h-3 overflow-hidden rounded-full bg-teal-100" role="progressbar" aria-label={label} aria-valuenow={Math.min(value, max)} aria-valuemin={0} aria-valuemax={max}>
                <div className="h-full rounded-full bg-teal-700 motion-safe:transition-all" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
