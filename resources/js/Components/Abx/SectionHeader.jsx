export default function SectionHeader({ eyebrow, title, subtitle, as: Tag = 'h2', className = '' }) {
    const size = Tag === 'h1' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl';
    return (
        <header className={`mb-6 ${className}`}>
            {eyebrow && <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">{eyebrow}</p>}
            <Tag className={`mt-1 font-bold leading-tight text-teal-950 ${size}`}>{title}</Tag>
            {subtitle && <p className="mt-2 max-w-3xl text-lg text-gray-700">{subtitle}</p>}
        </header>
    );
}
