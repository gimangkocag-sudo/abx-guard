import { useCallback, useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import AbxLayout from '@/Layouts/AbxLayout';
import PageContainer from '@/Components/Abx/PageContainer';
import Card from '@/Components/Abx/Card';
import PharmacistChat from '@/Components/Abx/PharmacistChat';

const statusLabel = (status) => ({ open: 'Terbuka', waiting: 'Menunggu balasan', closed: 'Ditutup' }[status] || status);

export default function Inbox() {
    const { auth } = usePage().props;
    const [conversations, setConversations] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [availability, setAvailability] = useState({ operational: false, realtime: false, realtime_config: null, poll_interval_ms: 10000 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    const loadInbox = useCallback(async () => {
        try {
            const { data } = await axios.get('/pharmacist/inbox/conversations');
            setConversations(data.data.data);
            setAvailability({ operational: data.operational, realtime: data.realtime, realtime_config: data.realtime_config, poll_interval_ms: data.poll_interval_ms });
            setSelectedId((current) => current ?? data.data.data[0]?.id ?? null);
            setError('');
        } catch {
            setError('Inbox belum dapat dimuat. Coba lagi.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInbox();
        const timer = window.setInterval(loadInbox, 15000);
        return () => window.clearInterval(timer);
    }, [loadInbox]);

    const selected = conversations.find((item) => item.id === selectedId);

    const claim = async () => {
        setStatus('');
        try {
            await axios.post(`/pharmacist/inbox/conversations/${selectedId}/claim`);
            setConversations((current) => current.map((item) => item.id === selectedId ? { ...item, assigned_to_me: true } : item));
            setStatus('Percakapan ditugaskan kepada Anda.');
        } catch (requestError) {
            setStatus(requestError.response?.status === 409 ? 'Petugas lain telah mengambil percakapan ini.' : 'Percakapan belum dapat diambil. Muat ulang inbox.');
            loadInbox();
        }
    };

    const changeStatus = async (event) => {
        try {
            await axios.patch(`/pharmacist/inbox/conversations/${selectedId}/status`, { status: event.target.value });
            setConversations((current) => current.map((item) => item.id === selectedId ? { ...item, status: event.target.value } : item));
            setStatus('Status percakapan diperbarui.');
        } catch {
            setStatus('Status belum dapat diperbarui. Coba lagi.');
        }
    };

    return (
        <AbxLayout>
            <Head title="Inbox Apoteker" />
            <PageContainer>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-[#1769AA]">Area petugas</p>
                        <h1 className="mt-1 text-2xl font-bold text-[#163B70]">Inbox Pharmacist Connect</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">Hanya petugas dengan izin eksplisit yang dapat mengakses inbox dan percakapan yang belum ditugaskan atau ditugaskan kepadanya.</p>
                    </div>
                    <Link href="/belajar/pharmacist-connect" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-[#163B70] hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1769AA]">Lihat halaman pengguna</Link>
                </div>
                {!availability.operational && !loading && <p role="status" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">Penerimaan pesan publik masih dinonaktifkan. Inbox dapat digunakan untuk meninjau riwayat yang sudah ada.</p>}
                {error && <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error} <button type="button" onClick={loadInbox} className="font-semibold underline">Coba lagi</button></p>}
                {status && <p role="status" className="mb-4 rounded-lg border border-blue-200 bg-[#DCEEFF] p-3 text-sm text-[#163B70]">{status}</p>}
                <Card className="grid gap-5 lg:grid-cols-[minmax(16rem,0.36fr)_minmax(0,1fr)]">
                    <section aria-labelledby="inbox-list-heading">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <h2 id="inbox-list-heading" className="font-bold text-[#163B70]">Percakapan</h2>
                            <button type="button" onClick={loadInbox} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-[#1769AA] hover:bg-[#DCEEFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1769AA]">Segarkan</button>
                        </div>
                        {loading && <p role="status" className="text-sm text-slate-600">Memuat inbox…</p>}
                        {!loading && conversations.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Belum ada percakapan untuk ditangani.</p>}
                        <ul className="max-h-[65vh] space-y-2 overflow-y-auto">
                            {conversations.map((item) => <li key={item.id}><button type="button" onClick={() => setSelectedId(item.id)} aria-pressed={selectedId === item.id} className={`min-h-16 w-full rounded-lg border p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1769AA] ${selectedId === item.id ? 'border-[#1769AA] bg-[#DCEEFF]' : 'border-slate-200 bg-white hover:bg-slate-50'}`}><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-[#163B70]">{item.owner_name}</strong><span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-700">{statusLabel(item.status)}</span></span><span className="mt-1 block truncate text-xs text-slate-600">{item.last_message?.body || 'Belum ada pesan'}{!item.assigned_to_me && ' · Belum ditugaskan'}</span></button></li>)}
                        </ul>
                    </section>
                    <section aria-label="Detail percakapan" className="min-w-0">
                        {!selected ? <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">Pilih percakapan dari inbox.</div> : <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                                <div><h2 className="font-bold text-[#163B70]">Percakapan #{selected.id}</h2><p className="text-sm text-slate-600">Pengguna: {selected.owner_name}</p></div>
                                {!selected.assigned_to_me ? <button type="button" onClick={claim} className="min-h-11 rounded-lg bg-[#1769AA] px-4 text-sm font-semibold text-white hover:bg-[#163B70] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Ambil percakapan</button> : <label className="text-sm font-medium text-slate-700">Status <select value={selected.status} onChange={changeStatus} className="ml-2 min-h-11 rounded-lg border border-slate-300 bg-white px-2"><option value="open">Terbuka</option><option value="waiting">Menunggu pengguna</option><option value="closed">Ditutup</option></select></label>}
                            </div>
                            <PharmacistChat key={selected.id} conversationId={selected.id} viewerId={auth.user.id} operational={availability.operational} realtime={availability.realtime} realtimeConfig={availability.realtime_config} pollInterval={availability.poll_interval_ms} staff canSend={selected.assigned_to_me} />
                        </div>}
                    </section>
                </Card>
            </PageContainer>
        </AbxLayout>
    );
}
