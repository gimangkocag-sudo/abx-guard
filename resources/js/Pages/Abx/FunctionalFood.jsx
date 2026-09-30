import { Head } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import SectionHeader from '@/Components/Abx/SectionHeader';
import Card from '@/Components/Abx/Card';
import EducationalCard from '@/Components/Abx/EducationalCard';
import CTASection from '@/Components/Abx/CTASection';
import Disclaimer from '@/Components/Abx/Disclaimer';
import { BAL, FERMENTED, BIOTICS } from '@/content/food';

export default function FunctionalFood() {
    return (
        <AbxLayout>
            <Head title="BAL & Functional Food" />
            <PageContainer>
                <SectionHeader as="h1" eyebrow="BAL & Functional Food" title="Kenali Bakteri Asam Laktat dan Pangan Fungsional" />

                <Card className="sm:p-8">
                    <h2 className="text-xl font-bold text-teal-950">Apa Itu Bakteri Asam Laktat?</h2>
                    <p className="mt-3 text-gray-700">{BAL.intro}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                        {BAL.genera.map((g) => <li key={g} className="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium italic text-teal-900">{g}</li>)}
                    </ul>
                    <p className="mt-3 text-gray-700">{BAL.outro}</p>
                </Card>

                <Card className="mt-6 sm:p-8">
                    <h2 className="text-xl font-bold text-teal-950">Pangan Fermentasi</h2>
                    <p className="mt-3 text-gray-700">{FERMENTED.intro}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {FERMENTED.items.map((f) => <EducationalCard key={f.title} icon={f.icon} title={f.title}>{f.text}</EducationalCard>)}
                    </div>
                    <aside role="note" className="mt-5 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-amber-950">
                        <strong className="block">Penting!</strong>{FERMENTED.important}
                    </aside>
                </Card>

                <SectionHeader className="mt-12" title="Probiotik, Prebiotik, Sinbiotik, Postbiotik" subtitle="Perbandingan sederhana keempat istilah berikut." />
                <div className="grid gap-4 md:grid-cols-2">
                    {BIOTICS.map((b) => (
                        <Card key={b.key}>
                            <h3 className="flex items-center gap-2 text-lg font-bold text-teal-950"><span aria-hidden="true" className="text-2xl">{b.icon}</span>{b.title}</h3>
                            <p className="mt-2 font-medium text-teal-900">{b.definition}</p>
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">{b.points.map((p) => <li key={p}>{p}</li>)}</ul>
                            {b.note && <p className="mt-3 rounded-xl bg-teal-50 p-3 text-sm text-teal-950"><strong>Catatan: </strong>{b.note}</p>}
                        </Card>
                    ))}
                </div>

                <div className="mt-10">
                    <CTASection title="Uji pemahamanmu" actions={[{ label: 'Myth or Fact', href: '/belajar/myth-or-fact' }, { label: 'Microbiome Care', href: '/belajar/mikrobioma' }]} />
                </div>
                <Disclaimer className="mt-10" />
            </PageContainer>
        </AbxLayout>
    );
}
