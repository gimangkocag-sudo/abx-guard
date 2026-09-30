import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import SectionHeader from '@/Components/Abx/SectionHeader';
import Card from '@/Components/Abx/Card';
import FadeIn from '@/Components/Abx/FadeIn';
import CTASection from '@/Components/Abx/CTASection';
import Disclaimer from '@/Components/Abx/Disclaimer';
import { PHARMACIST } from '@/content/misc';

export default function Pharmacist() {
    const [active, setActive] = useState(0);
    const ex = PHARMACIST.examples[active];
    return (
        <AbxLayout>
            <Head title="Pharmacist Connect" />
            <PageContainer>
                <SectionHeader as="h1" eyebrow="Pharmacist Connect" title="Punya Pertanyaan tentang Obat?" subtitle="Tanya Apoteker. Jangan Menebak." />
                <p className="-mt-2 mb-8 max-w-3xl text-gray-700">{PHARMACIST.intro}</p>

                <section aria-labelledby="peran">
                    <h2 id="peran" className="mb-4 text-xl font-bold text-teal-950">Peran Apoteker di ABX Guard</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {PHARMACIST.roles.map((r) => (
                            <Card key={r.no}>
                                <span className="rounded-lg bg-teal-100 px-2 py-1 text-sm font-extrabold text-teal-800">{r.no}</span>
                                <h3 className="mt-3 font-bold text-teal-950">{r.title}</h3>
                                <p className="mt-1 text-gray-700">{r.text}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="contoh" className="mt-12">
                    <h2 id="contoh" className="mb-1 text-xl font-bold text-teal-950">Contoh Konsultasi</h2>
                    <p className="mb-4 text-gray-600">Pilih salah satu contoh pertanyaan.</p>
                    <div className="rounded-3xl border border-teal-100 bg-white p-4 shadow-sm sm:p-6">
                        <div role="group" aria-label="Contoh pertanyaan" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            {PHARMACIST.examples.map((e, i) => (
                                <button key={e.q} type="button" aria-pressed={active === i} onClick={() => setActive(i)}
                                    className={`min-h-12 rounded-full border px-4 py-2 text-left text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${active === i ? 'border-teal-600 bg-teal-600 text-white' : 'border-teal-200 bg-white text-teal-900 hover:bg-teal-50'}`}>
                                    {e.q}
                                </button>
                            ))}
                        </div>
                        <FadeIn key={active} className="mt-5 space-y-3" >
                            <div className="ml-auto max-w-lg rounded-2xl rounded-br-sm bg-teal-600 p-4 text-white"><span className="block text-xs font-semibold uppercase opacity-80">Pengguna</span>{ex.q}</div>
                            <div className="max-w-lg rounded-2xl rounded-bl-sm bg-teal-50 p-4 text-teal-950"><span className="block text-xs font-semibold uppercase text-teal-700">Apoteker</span>{ex.a}</div>
                        </FadeIn>
                        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-2">
                            <label htmlFor="ask" className="sr-only">Tulis pertanyaan untuk apoteker</label>
                            <input id="ask" disabled placeholder="Konsultasi langsung dengan apoteker belum tersedia" className="min-h-12 flex-1 cursor-not-allowed rounded-xl border-0 bg-transparent px-3 text-gray-500" />
                            <button type="button" disabled className="min-h-12 rounded-xl bg-gray-300 px-5 font-semibold text-white">Kirim</button>
                        </div>
                        <p className="mt-2 text-xs text-gray-600">Fitur tanya jawab langsung dengan apoteker akan dikembangkan pada tahap berikutnya. Halaman ini hanya berisi contoh edukasi, bukan diagnosis otomatis.</p>
                    </div>
                </section>

                <div className="mt-10"><CTASection title="Pelajari lebih lanjut" actions={[{ label: 'Bijak Antibiotik', href: '/belajar/bijak-antibiotik' }, { label: 'Kenali AMR', href: '/belajar/amr' }]} /></div>
                <Disclaimer className="mt-10">{PHARMACIST.disclaimer}</Disclaimer>
            </PageContainer>
        </AbxLayout>
    );
}
