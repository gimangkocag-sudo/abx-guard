import { Head } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import SectionHeader from '@/Components/Abx/SectionHeader';
import Accordion from '@/Components/Abx/Accordion';
import RichBlocks from '@/Components/Abx/RichBlocks';
import CTASection from '@/Components/Abx/CTASection';
import Disclaimer from '@/Components/Abx/Disclaimer';
import { BIJAK } from '@/content/bijak';

export default function Bijak() {
    const items = BIJAK.map((s) => ({ title: s.title, icon: s.icon, content: <RichBlocks blocks={s.blocks} /> }));
    return (
        <AbxLayout>
            <Head title="Bijak Antibiotik" />
            <PageContainer>
                <SectionHeader as="h1" eyebrow="Bijak Antibiotik" title="Kenali Antibiotik Sebelum Menggunakannya" />
                <Accordion items={items} id="bijak" />
                <div className="mt-10">
                    <CTASection title="Masih ada pertanyaan?" description="Apoteker dapat membantu menjelaskan cara penggunaan antibiotik agar kamu memahami obat yang digunakan."
                        actions={[{ label: 'Tanya Apoteker', href: '/belajar/pharmacist-connect' }, { label: 'Pelajari AMR', href: '/belajar/amr' }]} />
                </div>
                <Disclaimer className="mt-10" />
            </PageContainer>
        </AbxLayout>
    );
}
