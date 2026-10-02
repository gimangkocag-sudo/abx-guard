import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import SectionHeader from '@/Components/Abx/SectionHeader';
import Card from '@/Components/Abx/Card';
import RichBlocks from '@/Components/Abx/RichBlocks';
import ProgressBar from '@/Components/Abx/ProgressBar';
import CTASection from '@/Components/Abx/CTASection';
import Disclaimer from '@/Components/Abx/Disclaimer';
import { AMR_SECTIONS, FLOW, STEPS } from '@/content/amr';

function Flow() {
    return (
        <ol className="my-4 space-y-1" aria-label="Alur terjadinya resistensi">
            {FLOW.map((f, i) => (
                <li key={f} className="text-center">
                    <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 font-semibold text-teal-950">{f}</div>
                    {i < FLOW.length - 1 && <div aria-hidden="true" className="py-1 text-xl text-teal-600">↓</div>}
                </li>
            ))}
        </ol>
    );
}

function Steps() {
    const [done, setDone] = useState([]);
    const toggle = (i) => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));
    return (
        <div>
            <p className="mb-2 text-sm font-semibold text-teal-900">5 langkah sederhana · {done.length}/{STEPS.length} sudah dipahami</p>
            <ProgressBar value={done.length} max={STEPS.length} label="Langkah pencegahan yang sudah dipahami" />
            <ul className="mt-4 grid gap-3">
                {STEPS.map((s, i) => {
                    const on = done.includes(i);
                    return (
                        <li key={s}>
                            <button type="button" aria-pressed={on} onClick={() => toggle(i)}
                                className={`flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${on ? 'border-teal-600 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-300'}`}>
                                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-teal-700 font-bold text-white">{on ? '✓' : i + 1}</span>
                                <span className="flex-1 font-medium text-gray-900">{s}</span>
                                <span className="text-xs font-semibold text-teal-800">{on ? 'Sudah paham' : 'Ketuk jika paham'}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default function Amr() {
    return (
        <AbxLayout>
            <Head title="AMR Education" />
            <PageContainer>
                <SectionHeader as="h1" eyebrow="AMR Education" title="AMR DALAM 5 MENIT" />
                <div className="space-y-6">
                    {AMR_SECTIONS.map((s) => (
                        <Card key={s.no} className="sm:p-8">
                            <h2 className="flex items-center gap-3 text-xl font-bold text-teal-950">
                                <span className="rounded-lg bg-teal-100 px-2 py-1 text-sm font-extrabold text-teal-800">{s.no}</span>{s.title}
                            </h2>
                            <div className="mt-4">
                                {s.blocks.length > 0 && <RichBlocks blocks={s.blocks} />}
                                {s.special === 'flow' && <Flow />}
                                {s.special === 'steps' && <Steps />}
                                {s.after && <div className="mt-4"><RichBlocks blocks={s.after} /></div>}
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="mt-10">
                    <CTASection title="Lanjutkan belajar" actions={[{ label: 'Bijak Antibiotik', href: '/belajar/bijak-antibiotik' }, { label: 'AMR Challenge', href: '/amr-challenge' }, { label: 'Tanya Apoteker', href: '/belajar/pharmacist-connect' }]} />
                </div>
                <Disclaimer className="mt-10" />
            </PageContainer>
        </AbxLayout>
    );
}
