import { CLOSING } from '@/content/misc';

export default function ClosingBlock() {
    return (
        <section aria-labelledby="closing" className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
            <h2 id="closing" className="text-2xl font-extrabold leading-tight text-teal-950 sm:text-3xl">THINK BEFORE ANTIBIOTICS.<br />PROTECT YOUR MICROBIOME.</h2>
            <p className="mt-3 max-w-3xl text-gray-700">{CLOSING.text}</p>
            <p className="mt-4 font-semibold text-teal-900">Sebelum menggunakan antibiotik:</p>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {CLOSING.items.map((c) => (
                    <div key={c.key} className="rounded-2xl bg-teal-50 p-4">
                        <dt className="text-sm font-extrabold tracking-widest text-teal-700">{c.key}</dt>
                        <dd className="mt-1 text-gray-800">{c.text}</dd>
                    </div>
                ))}
            </dl>
            <p className="mt-5 font-medium text-teal-900">{CLOSING.tagline}</p>
        </section>
    );
}
