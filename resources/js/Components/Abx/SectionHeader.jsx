export default function SectionHeader({ eyebrow, title, subtitle, as: Tag = 'h2', className = '' }) {
    const size = Tag === 'h1' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl';
    return (
        <header className={`mb-7 ${className}`}>
            {eyebrow && <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">{eyebrow}</p>}
            <Tag className={`mt-1 font-bold leading-tight tracking-tight text-teal-950 ${size}`}>{title}</Tag>
            {subtitle && <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{subtitle}</p>}
        </header>
    );
}
