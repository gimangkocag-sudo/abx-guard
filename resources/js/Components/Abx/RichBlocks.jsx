import EducationalCard from './EducationalCard';

const tones = {
    note: 'border-teal-500 bg-teal-50 text-teal-950',
    avoid: 'border-rose-400 bg-rose-50 text-rose-950',
    better: 'border-emerald-500 bg-emerald-50 text-emerald-950',
};

/** Render blok konten dari resources/js/content/*.js: p, ul, marks, dl, note, cards. */
export default function RichBlocks({ blocks }) {
    return (
        <div className="space-y-4 leading-relaxed text-gray-700">
            {blocks.map((b, i) => {
                switch (b.type) {
                    case 'p':
                        return <p key={i}>{b.text}</p>;
                    case 'ul':
                        return <ul key={i} className="list-disc space-y-1 pl-6">{b.items.map((t) => <li key={t}>{t}</li>)}</ul>;
                    case 'marks':
                        return (
                            <div key={i}>
                                {b.label && <p className="mb-1 font-semibold text-teal-950">{b.label}</p>}
                                <ul className="space-y-1">
                                    {b.items.map((t) => (
                                        <li key={t} className="flex gap-2"><span aria-hidden="true">{b.mark}</span><span className="sr-only">{b.mark === '✗' ? 'Jangan: ' : 'Lebih tepat: '}</span>{t}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    case 'dl':
                        return (
                            <dl key={i} className="space-y-2">
                                {b.items.map((d) => (
                                    <div key={d.term}><dt className="font-semibold text-teal-950">{d.term}</dt><dd>{d.text}</dd></div>
                                ))}
                            </dl>
                        );
                    case 'note':
                        return (
                            <aside key={i} className={`rounded-xl border-l-4 p-4 ${tones[b.tone || 'note']}`}>
                                {b.label && <strong className="block">{b.label}</strong>}
                                {b.text}
                            </aside>
                        );
                    case 'cards':
                        return (
                            <div key={i} className="grid gap-3 sm:grid-cols-2">
                                {b.items.map((c) => <EducationalCard key={c.title} icon={c.icon} title={c.title}>{c.text}</EducationalCard>)}
                            </div>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
}
