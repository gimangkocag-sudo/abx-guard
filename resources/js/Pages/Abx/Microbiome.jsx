import { Head } from '@inertiajs/react';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import SectionHeader from '@/Components/Abx/SectionHeader';
import Accordion from '@/Components/Abx/Accordion';
import RichBlocks from '@/Components/Abx/RichBlocks';
import CTASection from '@/Components/Abx/CTASection';
import Disclaimer from '@/Components/Abx/Disclaimer';
import { MICROBIOME } from '@/content/microbiome';

export default function Microbiome() {
    const items = MICROBIOME.map((s) => ({ title: s.title, icon: s.icon, content: <RichBlocks blocks={s.blocks} /> }));
    return (
        <AbxLayout>
            <Head title="Microbiome Care" />
            <PageContainer>
                <SectionHeader as="h1" eyebrow="Microbiome Care" title="Kenali Dunia Mikroorganisme di Dalam Tubuhmu"
                    subtitle="Tubuh manusia hidup berdampingan dengan berbagai mikroorganisme. Salah satu komunitas yang penting untuk dipelajari adalah mikroorganisme yang berada di saluran pencernaan. Mikroorganisme tersebut membentuk komunitas yang kompleks dan dapat berinteraksi dengan tubuh manusia." />
                <Accordion items={items} id="mikro" />
                <div className="mt-10">
                    <CTASection title="Lanjutkan belajar" actions={[{ label: 'Pangan Fungsional', href: '/belajar/pangan-fungsional' }, { label: 'Kenali AMR', href: '/belajar/amr' }, { label: 'Myth or Fact', href: '/belajar/myth-or-fact' }]} />
                </div>
                <Disclaimer className="mt-10" />
            </PageContainer>
        </AbxLayout>
    );
}
