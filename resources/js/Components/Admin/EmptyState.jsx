export default function EmptyState({ title = 'Belum ada data', children }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p aria-hidden="true" className="text-3xl">📭</p>
            <p className="mt-2 font-semibold text-slate-800">{title}</p>
            {children && <p className="mt-1 text-sm text-slate-600">{children}</p>}
        </div>
    );
}
