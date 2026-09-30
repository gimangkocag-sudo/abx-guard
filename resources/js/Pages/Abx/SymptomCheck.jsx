import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import SectionHeader from '@/Components/Abx/SectionHeader';
import Button from '@/Components/Abx/Button';
import EducationalCard from '@/Components/Abx/EducationalCard';
import Disclaimer from '@/Components/Abx/Disclaimer';
import FadeIn from '@/Components/Abx/FadeIn';
import { SYMPTOMS, GENERAL, EXAMPLES, NOTE } from '@/content/symptoms';

export default function SymptomCheck() {
    const [selected, setSelected] = useState([]);
    const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    const exampleKeys = [...new Set(SYMPTOMS.filter((s) => selected.includes(s.id) && s.example).map((s) => s.example))];

    return (
        <AbxLayout>
            <Head title="Symptom Check" />
            <PageContainer>
                <SectionHeader as="h1" eyebrow="Symptom Check" title="Apa yang Sedang Kamu Rasakan?" subtitle="Pilih keluhan yang sesuai dengan kondisi kamu." />

                <fieldset>
                    <legend className="sr-only">Pilih keluhan (boleh lebih dari satu)</legend>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {SYMPTOMS.map((s) => {
                            const on = selected.includes(s.id);
                            return (
                                <button key={s.id} type="button" aria-pressed={on} onClick={() => toggle(s.id)}
                                    className={`flex min-h-16 items-center gap-3 rounded-2xl border-2 p-4 text-left font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${on ? 'border-teal-600 bg-teal-50 text-teal-950' : 'border-gray-200 bg-white hover:border-teal-300'}`}>
                                    <span aria-hidden="true" className="text-2xl">{s.icon}</span>
                                    <span className="flex-1">{s.label}</span>
                                    <span aria-hidden="true">{on ? '✓' : '☐'}</span>
                                </button>
                            );
                        })}
                    </div>
                </fieldset>

                <div className="mt-8" aria-live="polite">
                    {selected.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-teal-200 bg-white p-8 text-center text-gray-600">
                            Pilih satu atau lebih keluhan untuk melihat materi edukasi yang relevan.
                        </p>
                    ) : (
                        <FadeIn key={selected.join('|')}>
                            <SectionHeader title="Apa yang Perlu Kamu Ketahui?" />
                            <p className="text-gray-700">{GENERAL}</p>
                            {exampleKeys.length > 0 && (
                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    {exampleKeys.map((k) => <EducationalCard key={k} title={EXAMPLES[k].title}>{EXAMPLES[k].text}</EducationalCard>)}
                                </div>
                            )}
                            <h3 className="mb-3 mt-8 text-lg font-bold text-teal-950">Apa yang Ingin Kamu Lakukan?</h3>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <Button href="/belajar/bijak-antibiotik">Pelajari Antibiotik</Button>
                                <Button href="/belajar/amr" variant="secondary">Pelajari AMR</Button>
                                <Button href="/belajar/pharmacist-connect" variant="secondary">Konsultasi Apoteker</Button>
                            </div>
                            <button type="button" onClick={() => setSelected([])} className="mt-4 min-h-12 px-2 text-sm font-medium text-teal-700 underline">Hapus pilihan</button>
                        </FadeIn>
                    )}
                </div>

                <Disclaimer className="mt-10">{NOTE}</Disclaimer>
            </PageContainer>
        </AbxLayout>
    );
}
