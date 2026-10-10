import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getPharmacistEcho } from '@/realtime/pharmacistEcho';

const messageUrl = (conversationId) => `/pharmacist-connect/conversations/${conversationId}`;
const statusLabel = (status) => ({ open: 'Terbuka', waiting: 'Menunggu balasan', closed: 'Ditutup' }[status] || status);

function MessageList({ messages, viewerId, bottomRef }) {
    return (
        <ol aria-label="Riwayat pesan" className="max-h-[55vh] min-h-40 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
            {messages.length === 0 && <li className="py-8 text-center text-sm text-slate-600">Belum ada pesan. Kirim pertanyaan untuk memulai percakapan.</li>}
            {messages.map((message) => {
                const mine = message.sender_id === viewerId;
                return (
                    <li key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <article className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2.5 text-sm leading-6 sm:max-w-[75%] ${mine ? 'rounded-br-sm bg-blue-700 text-white' : 'rounded-bl-sm border border-slate-200 bg-white text-slate-900'}`}>
                            <p className={`mb-1 text-xs font-semibold ${mine ? 'text-blue-100' : 'text-slate-600'}`}>{mine ? 'Anda' : 'Petugas apoteker'}</p>
                            <p>{message.body}</p>
                            <time className={`mt-1 block text-right text-[11px] ${mine ? 'text-blue-100' : 'text-slate-500'}`} dateTime={message.created_at}>
                                {message.created_at ? new Date(message.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                            </time>
                        </article>
                    </li>
                );
            })}
            <li ref={bottomRef} aria-hidden="true" />
        </ol>
    );
}

export default function PharmacistChat({ conversationId, viewerId, operational, realtime, realtimeConfig, pollInterval = 10000, staff = false, canSend = true }) {
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [socketState, setSocketState] = useState('polling');
    const bottomRef = useRef(null);
    const lastIdRef = useRef(0);
    const activeConversationRef = useRef(conversationId);
    activeConversationRef.current = conversationId;
    const lastId = messages.at(-1)?.id ?? 0;

    useEffect(() => { lastIdRef.current = lastId; }, [lastId]);

    const refresh = useCallback(async (afterId = 0) => {
        if (!conversationId) return;
        const requestedConversationId = conversationId;
        try {
            const { data } = await axios.get(`${messageUrl(conversationId)}?after_id=${afterId}`);
            if (activeConversationRef.current !== requestedConversationId) return;
            setConversation(data.conversation);
            setMessages((current) => {
                if (afterId === 0) return data.messages;
                const known = new Set(current.map((message) => message.id));
                return [...current, ...data.messages.filter((message) => !known.has(message.id))];
            });
            setError('');
        } catch (requestError) {
            if (activeConversationRef.current !== requestedConversationId) return;
            if (requestError.response?.status === 403 || requestError.response?.status === 404) {
                setError('Percakapan ini tidak dapat diakses oleh akun Anda.');
            } else {
                setError('Riwayat belum dapat dimuat. Periksa koneksi lalu coba lagi.');
            }
        }
    }, [conversationId]);

    useEffect(() => {
        setMessages([]);
        setConversation(null);
        setError('');
        if (!conversationId) return undefined;
        let active = true;
        const load = async () => {
            if (!active) return;
            setLoading(true);
            await refresh(0);
            if (activeConversationRef.current === conversationId) setLoading(false);
        };
        load();
        const timer = window.setInterval(() => { if (active) refresh(lastIdRef.current); }, Math.max(5000, pollInterval));
        return () => { active = false; window.clearInterval(timer); };
    }, [conversationId, pollInterval, refresh]);

    useEffect(() => {
        const echo = realtime ? getPharmacistEcho(realtimeConfig) : null;
        if (!conversationId || !echo) {
            setSocketState('polling');
            return undefined;
        }

        const connection = echo.connector?.pusher?.connection;
        const handleState = (state) => setSocketState(state.current === 'connected' ? 'connected' : 'polling');
        connection?.bind('state_change', handleState);
        const channel = echo.private(`pharmacist.conversations.${conversationId}`);
        channel.listen('.pharmacist.message.created', (event) => {
            if (event.id > lastIdRef.current) refresh(lastIdRef.current);
        });

        return () => {
            channel.stopListening('.pharmacist.message.created');
            echo.leave(`pharmacist.conversations.${conversationId}`);
            connection?.unbind('state_change', handleState);
        };
    }, [conversationId, realtime, realtimeConfig, refresh]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages.length]);

    const send = async (event) => {
        event.preventDefault();
        if (!conversationId || !body.trim() || sending) return;
        setSending(true);
        setError('');
        setNotice('');
        try {
            const url = staff ? `/pharmacist/inbox/conversations/${conversationId}/messages` : `${messageUrl(conversationId)}/messages`;
            const { data } = await axios.post(url, { body });
            setMessages((current) => current.some((message) => message.id === data.message.id) ? current : [...current, data.message]);
            setBody('');
            setNotice(data.realtime ? 'Pesan terkirim secara real-time.' : 'Pesan tersimpan. Balasan akan diperiksa berkala.');
            await refresh(data.message.id);
        } catch (requestError) {
            const status = requestError.response?.status;
            setError(status === 429 ? 'Terlalu banyak pesan dalam waktu singkat. Tunggu sebentar lalu coba lagi.' : requestError.response?.data?.message || 'Pesan belum terkirim. Periksa koneksi dan coba lagi.');
        } finally {
            setSending(false);
        }
    };

    if (!conversationId) {
        return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">Pilih percakapan untuk membaca riwayat pesan.</div>;
    }

    return (
        <section aria-label="Percakapan dengan petugas apoteker" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p role="status" className={`text-sm font-medium ${socketState === 'connected' ? 'text-emerald-800' : 'text-slate-600'}`}>
                    {socketState === 'connected' ? 'Terhubung secara real-time' : `Mode pembaruan berkala${realtime ? ' (WebSocket tidak tersambung)' : ''} · ${Math.round(pollInterval / 1000)} detik`}
                </p>
                {conversation?.status && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">Status: {statusLabel(conversation.status)}</span>}
            </div>
            {loading && <p role="status" className="text-sm text-slate-600">Memuat riwayat…</p>}
            <MessageList messages={messages} viewerId={viewerId} bottomRef={bottomRef} />
            {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
            {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error} <button type="button" onClick={() => refresh(lastId)} className="ml-1 min-h-11 font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Coba lagi</button></p>}
            {operational && canSend && conversation?.status !== 'closed' ? (
                <form onSubmit={send} className="space-y-2">
                    <label htmlFor="pharmacist-message" className="sr-only">Tulis pesan</label>
                    <textarea id="pharmacist-message" value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} rows={3} placeholder="Tulis pertanyaan Anda…" disabled={sending} className="min-h-24 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-500 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-slate-600">Maksimal 4.000 karakter. Jangan sertakan informasi darurat.</span>
                        <button type="submit" disabled={sending || !body.trim()} className="min-h-11 w-full rounded-lg bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto">{sending ? 'Mengirim…' : 'Kirim pesan'}</button>
                    </div>
                </form>
            ) : <p role="status" className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{conversation?.status === 'closed' ? 'Percakapan ini telah ditutup.' : !canSend ? 'Ambil tanggung jawab percakapan ini sebelum membalas.' : 'Layanan sedang offline. Riwayat tetap dapat dibaca; pengiriman pesan dibuka ketika petugas dan prosedur layanan tersedia.'}</p>}
        </section>
    );
}
