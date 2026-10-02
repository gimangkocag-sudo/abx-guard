import Button from './Button';

export default function CTASection({ title, description, actions }) {
    return (
        <section className="rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 p-6 text-white sm:p-10">
            <h2 className="text-2xl font-bold">{title}</h2>
            {description && <p className="mt-2 max-w-2xl text-teal-50">{description}</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {actions.map((a, i) => (
                    <Button key={a.href} href={a.href} variant={i === 0 ? 'secondary' : 'ghost'} className={i === 0 ? '' : 'border border-teal-200 !text-white hover:!bg-teal-800'}>{a.label}</Button>
                ))}
            </div>
        </section>
    );
}
