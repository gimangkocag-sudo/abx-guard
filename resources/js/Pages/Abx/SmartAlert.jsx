import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import SectionHeader from '@/Components/Abx/SectionHeader';
import Button from '@/Components/Abx/Button';
import Card from '@/Components/Abx/Card';
import Disclaimer from '@/Components/Abx/Disclaimer';
import FadeIn from '@/Components/Abx/FadeIn';
import { ALERT } from '@/content/misc';

export default function SmartAlert() {
    const [shown, setShown] = useState(false);
    return (
        <AbxLayout>
            <Head title="Smart ABX Alert" />
            <PageContainer className="max-w-3xl">
                <SectionHeader as="h1" eyebrow="Smart ABX Alert" title="THINK BEFORE ANTIBIOTICS" subtitle="Sebelum Menggunakan Antibiotik, Berhenti Sejenak." />
                <p className="mb-2 text-sm font-semibold text-gray-600">Contoh:</p>
                <div className="ml-auto max-w-md rounded-2xl rounded-br-sm bg-teal-700 p-4 text-white">“{ALERT.example}”</div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={() => setShown((value) => !value)} aria-expanded={shown} aria-controls="smart-alert-guidance">
                        {shown ? 'Tutup panduan' : 'Saya ingin minum antibiotik'}
                    </Button>
                </div>

                <div id="smart-alert-guidance" hidden={!shown}>
                    {shown && <FadeIn className="mt-6">
                            <section aria-labelledby="smart-alert-heading" role="status" aria-live="polite" className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 sm:p-6">
                            <p className="text-sm font-extrabold uppercase tracking-widest text-amber-800">⏸ SMART ABX ALERT</p>
                            <h2 id="smart-alert-heading" className="mt-2 text-2xl font-bold text-amber-950">{ALERT.title}</h2>
                            <p className="mt-3 text-amber-950">{ALERT.text}</p>
                        </section>
                        <h3 className="mb-3 mt-8 text-lg font-bold text-teal-950">Coba tanyakan pada diri sendiri:</h3>
                        <ol className="space-y-3">
                            {ALERT.questions.map((question, index) => (
                                <li key={question}><Card className="flex gap-4 !p-4"><span aria-hidden="true" className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-teal-100 font-bold text-teal-900">{index + 1}</span><span className="pt-1 font-medium text-gray-900">{question}</span></Card></li>
                            ))}
                        </ol>
                        <p className="mt-5 font-semibold text-teal-950">{ALERT.doubt}</p>
                        <h3 className="mb-3 mt-8 text-lg font-bold text-teal-950">Pilih langkah berikutnya:</h3>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {ALERT.ctas.map((cta, index) => <Button key={cta.href} href={cta.href} variant={index === 0 ? 'primary' : 'secondary'}>{cta.label}</Button>)}
                        </div>
                        </FadeIn>}
                </div>
                <Disclaimer className="mt-10" />
            </PageContainer>
        </AbxLayout>
    );
}
