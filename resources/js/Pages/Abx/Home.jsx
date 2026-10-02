import { Head } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import SectionHeader from '@/Components/Abx/SectionHeader';
import Button from '@/Components/Abx/Button';
import Card from '@/Components/Abx/Card';
import Disclaimer from '@/Components/Abx/Disclaimer';
import ClosingBlock from '@/Components/Abx/ClosingBlock';
import { EXPLORE } from '@/content/misc';

function Illustration() {
    return (
        <svg viewBox="0 0 320 260" role="img" aria-label="Ilustrasi perisai dengan daun dan mikroorganisme" className="mx-auto w-full max-w-sm">
            <circle cx="160" cy="130" r="118" fill="#ccfbf1" />
            <circle cx="70" cy="70" r="16" fill="#99f6e4" /><circle cx="254" cy="196" r="22" fill="#99f6e4" /><circle cx="262" cy="64" r="10" fill="#5eead4" />
            <path d="M160 40l78 28v58c0 52-34 84-78 100-44-16-78-48-78-100V68z" fill="#0d9488" />
            <path d="M160 70c-30 10-48 34-48 62 34-2 60-22 48-62z" fill="#f0fdfa" opacity=".95" />
            <path d="M160 74v96" stroke="#0f766e" strokeWidth="5" strokeLinecap="round" />
            <path d="M160 146c26-4 40-20 44-42-26 2-42 18-44 42z" fill="#99f6e4" />
        </svg>
    );
}

export default function Home() {
    return (
        <AbxLayout>
            <Head title="ABX Guard — Think Before Antibiotics" />
            <PageContainer>
                <section className="grid items-center gap-10 lg:grid-cols-2">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">ABX GUARD</p>
                        <h1 className="mt-3 break-words text-3xl font-extrabold leading-tight text-teal-950 sm:text-5xl">
                            THINK BEFORE ANTIBIOTICS.<br />PROTECT YOUR MICROBIOME.
                        </h1>
                        <p className="mt-4 text-xl font-medium text-teal-800">Kenali Keluhanmu. Pahami Antibiotikmu. Jaga Mikrobiomamu.</p>
                        <p className="mt-4 text-gray-700">
                            Tidak semua keluhan kesehatan membutuhkan antibiotik. Sebelum menggunakan antibiotik, kenali terlebih dahulu informasi yang tepat mengenai keluhan, penggunaan antibiotik, resistensi antimikroba, dan kesehatan mikrobioma.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button href="/cek-keluhan">Cek Keluhan</Button>
                            <Button href="/smart-abx-alert" variant="secondary">Saya Ingin Menggunakan Antibiotik</Button>
                        </div>
                    </div>
                    <Illustration />
                </section>

                <section className="mt-16">
                    <SectionHeader title="Jelajahi ABX Guard" subtitle="ABX Guard membantu kamu mendapatkan informasi sederhana dan mudah dipahami sebelum mengambil keputusan terkait penggunaan antibiotik." />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {EXPLORE.map((e) => (
                            <Card key={e.href} href={e.href}>
                                <span aria-hidden="true" className="text-3xl">{e.icon}</span>
                                <h3 className="mt-3 text-lg font-bold text-teal-950">{e.title}</h3>
                                <p className="mt-1 text-gray-700">{e.text}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="mt-16"><ClosingBlock /></section>
                <Disclaimer className="mt-10" />
            </PageContainer>
        </AbxLayout>
    );
}
