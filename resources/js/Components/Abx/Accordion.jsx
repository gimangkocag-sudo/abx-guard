import { useState } from 'react';

export default function Accordion({ items, defaultOpen = 0, id = 'acc' }) {
    const [open, setOpen] = useState(defaultOpen === null ? [] : [defaultOpen]);
    const toggle = (i) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));

    return (
        <div className="space-y-3">
            {items.map((it, i) => {
                const isOpen = open.includes(i);
                return (
                    <div key={it.title} className="rounded-2xl border border-teal-100 bg-white shadow-sm">
                        <h3>
                            <button type="button" id={`${id}-b${i}`} aria-expanded={isOpen} aria-controls={`${id}-p${i}`} onClick={() => toggle(i)}
                                className="flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl px-5 py-3 text-left font-semibold text-teal-950 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                                <span>{it.icon && <span aria-hidden="true" className="mr-2">{it.icon}</span>}{it.title}</span>
                                <span aria-hidden="true" className={`motion-safe:transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                            </button>
                        </h3>
                        <div id={`${id}-p${i}`} role="region" aria-labelledby={`${id}-b${i}`} hidden={!isOpen} className="px-5 pb-5">
                            {it.content}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
