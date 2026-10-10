import { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import SectionHeader from '@/Components/Abx/SectionHeader';
import Card from '@/Components/Abx/Card';
import CTASection from '@/Components/Abx/CTASection';
import Disclaimer from '@/Components/Abx/Disclaimer';
import PharmacistChat from '@/Components/Abx/PharmacistChat';
import { PHARMACIST } from '@/content/misc';

export default function Pharmacist() {
    const { auth } = usePage().props;
    const [conversations, setConversations] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [availability, setAvailability] = useState({ operational: false, realtime: false, realtime_config: null, poll_interval_ms: 10000 });
    const [loading, setLoading] = useState(Boolean(auth?.user));
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const [activeExample, setActiveExample] = useState(0);

    const loadConversations = async () => {
        try {
            const { data } = await axios.get('/pharmacist-connect/conversations');
            setConversations(data.conversations);
            setAvailability({ operational: data.operational, realtime: data.realtime, realtime_config: data.realtime_config, poll_interval_ms: data.poll_interval_ms });
            setSelectedId((current) => current ?? data.conversations[0]?.id ?? null);
            setError('');
        } catch {
            setError('Riwayat percakapan belum dapat dimuat. Coba muat ulang halaman.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth?.user) loadConversations();
    }, [auth?.user?.id]);

    const startConversation = async () => {
        setCreating(true);
        setError('');
        try {
            const { data } = await axios.post('/pharmacist-connect/conversations');
            setConversations((current) => [data.conversation, ...current]);
            setSelectedId(data.conversation.id);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Percakapan belum dapat dimulai. Coba lagi nanti.');
        } finally {
            setCreating(false);
        }
    };

    const example = PHARMACIST.examples[activeExample];

    return (
        <AbxLayout>
            <Head title="Pharmacist Connect" />
            <PageContainer>
                <SectionHeader as="h1" eyebrow="Pharmacist Connect" title="Punya Pertanyaan tentang Obat?" subtitle="Tanya Apoteker. Jangan Menebak." />
                <p className="-mt-2 mb-8 max-w-3xl text-slate-700">{PHARMACIST.intro}</p>

                <section aria-labelledby="peran-apoteker">
                    <h2 id="peran-apoteker" className="mb-4 text-xl font-bold text-[#163B70]">Peran Apoteker di ABX Guard</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {PHARMACIST.roles.map((role) => (
                            <Card key={role.no}>
                                <span className="rounded-lg bg-[#DCEEFF] px-2 py-1 text-sm font-extrabold text-[#163B70]">{role.no}</span>
                                <h3 className="mt-3 font-bold text-[#163B70]">{role.title}</h3>
                                <p className="mt-1 text-slate-700">{role.text}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="konsultasi-heading" className="mt-10">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 id="konsultasi-heading" className="text-xl font-bold text-[#163B70]">Percakapan dengan Petugas</h2>
                            <p className="mt-1 text-sm text-slate-600">Riwayat pesan tersimpan pada akun Anda dan hanya dapat dibaca oleh Anda serta petugas yang ditugaskan.</p>
                        </div>
                        {auth?.user && availability.operational && <button type="button" onClick={startConversation} disabled={creating} className="min-h-11 w-full rounded-lg bg-[#1769AA] px-4 font-semibold text-white hover:bg-[#163B70] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769AA] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:w-auto">{creating ? 'Menyiapkan…' : 'Mulai percakapan'}</button>}
                    </div>

                    {!auth?.user ? (
                        <Card className="text-sm text-slate-700">Masuk ke akun untuk membuka riwayat dan mengirim pesan. <Link href="/login" className="font-semibold text-[#1769AA] underline focus-visible:outline focus-visible:outline-2">Masuk</Link></Card>
                    ) : (
                        <Card className="space-y-4">
                            {!availability.operational && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">Layanan pesan sedang belum tersedia. Pengelola belum mengaktifkan petugas dan prosedur konsultasi. Anda tetap dapat membaca percakapan lama.</p>}
                            {loading && <p role="status" className="text-sm text-slate-600">Memuat percakapan…</p>}
                            {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error} <button type="button" onClick={loadConversations} className="font-semibold underline">Coba lagi</button></p>}
                            {!loading && conversations.length > 0 && (
                                <div className="grid gap-4 lg:grid-cols-[minmax(12rem,0.32fr)_minmax(0,1fr)]">
                                    <div>
                                        <label htmlFor="conversation-list" className="mb-1 block text-sm font-semibold text-[#163B70]">Riwayat percakapan</label>
                                        <select id="conversation-list" value={selectedId ?? ''} onChange={(event) => setSelectedId(Number(event.target.value))} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#1769AA] focus:outline-none focus:ring-2 focus:ring-[#DCEEFF]">
                                            {conversations.map((conversation) => <option key={conversation.id} value={conversation.id}>#{conversation.id} · {conversation.status}</option>)}
                                        </select>
                                    </div>
                                    <PharmacistChat key={selectedId} conversationId={selectedId} viewerId={auth.user.id} operational={availability.operational} realtime={availability.realtime} realtimeConfig={availability.realtime_config} pollInterval={availability.poll_interval_ms} />
                                </div>
                            )}
                            {!loading && conversations.length === 0 && availability.operational && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">Belum ada percakapan. Mulai percakapan jika ingin mengirim pertanyaan.</p>}
                            {conversations.length > 0 && !selectedId && <p className="text-sm text-slate-600">Pilih percakapan untuk melihat pesan.</p>}
                        </Card>
                    )}
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">Jangan gunakan layanan pesan ini untuk keadaan darurat. Layanan ini bukan diagnosis otomatis dan bukan pengganti pemeriksaan langsung oleh tenaga kesehatan.</div>
                    <p className="mt-2 text-xs leading-5 text-slate-600">Status online petugas belum dipantau dan waktu balasan tidak dijanjikan. Jika koneksi real-time tidak tersedia, pesan diperbarui berkala.</p>
                </section>

                <section aria-labelledby="contoh-edukasi" className="mt-10">
                    <h2 id="contoh-edukasi" className="mb-1 text-xl font-bold text-[#163B70]">Contoh edukasi (simulasi)</h2>
                    <p className="mb-4 text-sm text-slate-600">Contoh berikut merupakan materi edukasi statis, bukan pesan atau jawaban dari petugas nyata.</p>
                    <Card>
                        <div role="group" aria-label="Pilih contoh edukasi" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            {PHARMACIST.examples.map((item, index) => <button key={item.q} type="button" aria-pressed={activeExample === index} onClick={() => setActiveExample(index)} className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769AA] ${activeExample === index ? 'border-[#1769AA] bg-[#DCEEFF] text-[#163B70]' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>{item.q}</button>)}
                        </div>
                        <div className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-800">
                            <p><strong>Pertanyaan contoh:</strong> {example.q}</p>
                            <p><strong>Informasi edukasi:</strong> {example.a}</p>
                        </div>
                    </Card>
                </section>

                <div className="mt-10"><CTASection title="Pelajari lebih lanjut" actions={[{ label: 'Bijak Antibiotik', href: '/belajar/bijak-antibiotik' }, { label: 'Kenali AMR', href: '/belajar/amr' }]} /></div>
                <Disclaimer className="mt-10">{PHARMACIST.disclaimer} Layanan pesan bukan untuk keadaan darurat, tidak memberikan diagnosis otomatis, dan tidak menggantikan pemeriksaan langsung oleh tenaga kesehatan.</Disclaimer>
            </PageContainer>
        </AbxLayout>
    );
}
