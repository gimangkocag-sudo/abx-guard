import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

const LEARN = [
    ['Bijak Antibiotik', '/belajar/bijak-antibiotik'],
    ['AMR Education', '/belajar/amr'],
    ['Microbiome Care', '/belajar/mikrobioma'],
    ['Functional Food', '/belajar/pangan-fungsional'],
    ['Pharmacist Connect', '/belajar/pharmacist-connect'],
    ['Myth or Fact', '/belajar/myth-or-fact'],
];

const link = 'rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500';

function useActive() {
    const { url } = usePage();
    const path = url.split('?')[0];
    return (href) => (href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`));
}

function LearnMenu({ isActive }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
    }, []);
    const active = isActive('/belajar');
    return (
        <div className="relative" ref={ref}>
            <button type="button" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(!open)}
                className={`${link} ${active ? 'bg-teal-100 text-teal-900' : 'text-gray-700 hover:bg-teal-50'}`}>Learn ▾</button>
            {open && (
                <ul className="absolute left-0 z-20 mt-2 w-56 rounded-xl border border-teal-100 bg-white p-2 shadow-lg">
                    {LEARN.map(([label, href]) => (
                        <li key={href}><Link href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">{label}</Link></li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function AbxLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isActive = useActive();
    const [menu, setMenu] = useState(false);
    const cls = (href) => `${link} ${isActive(href) ? 'bg-teal-100 text-teal-900' : 'text-gray-700 hover:bg-teal-50'}`;
    const close = () => setMenu(false);

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-teal-50/70 via-white to-white text-gray-900">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Lewati ke konten</a>
            <header className="sticky top-0 z-30 border-b border-teal-100 bg-white/90 backdrop-blur">
                <nav aria-label="Navigasi utama" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                    <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                        <span aria-hidden="true">🛡️</span> ABX GUARD
                    </Link>

                    <div className="hidden items-center gap-1 lg:flex">
                        <Link href="/" className={cls('/')}>Home</Link>
                        <Link href="/cek-keluhan" className={cls('/cek-keluhan')}>Symptom Check</Link>
                        <LearnMenu isActive={isActive} />
                        <Link href="/amr-challenge" className={cls('/amr-challenge')}>AMR Challenge</Link>
                        <Link href="/kap-survey" className={cls('/kap-survey')}>KAP Survey</Link>
                    </div>

                    <div className="hidden items-center gap-1 lg:flex">
                        {user ? (
                            <>
                                <Link href="/dashboard" className={cls('/dashboard')}>Dashboard</Link>
                                <Link href="/profile" className={cls('/profile')}>Profile</Link>
                                <Link href="/logout" method="post" as="button" className={`${link} text-gray-700 hover:bg-teal-50`}>Logout</Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className={cls('/login')}>Masuk</Link>
                                <Link href="/register" className="ml-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">Daftar</Link>
                            </>
                        )}
                    </div>

                    <button type="button" className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-200 text-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:hidden"
                        aria-label={menu ? 'Tutup menu' : 'Buka menu'} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu(!menu)}>
                        <span aria-hidden="true">{menu ? '✕' : '☰'}</span>
                    </button>
                </nav>

                {menu && (
                    <div id="mobile-menu" className="max-h-[80vh] overflow-y-auto border-t border-teal-100 bg-white px-4 pb-4 lg:hidden">
                        <ul className="space-y-1 pt-3">
                            {[['Home', '/'], ['Symptom Check', '/cek-keluhan']].map(([l, h]) => (
                                <li key={h}><Link href={h} onClick={close} className={`block min-h-12 ${cls(h)} flex items-center text-base`}>{l}</Link></li>
                            ))}
                            <li>
                                <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-teal-700">Learn</p>
                                <ul>
                                    {LEARN.map(([l, h]) => (
                                        <li key={h}><Link href={h} onClick={close} className={`flex min-h-12 items-center pl-6 text-base ${cls(h)}`}>{l}</Link></li>
                                    ))}
                                </ul>
                            </li>
                            {[['AMR Challenge', '/amr-challenge'], ['KAP Survey', '/kap-survey']].map(([l, h]) => (
                                <li key={h}><Link href={h} onClick={close} className={`flex min-h-12 items-center text-base ${cls(h)}`}>{l}</Link></li>
                            ))}
                        </ul>
                        <div className="mt-3 space-y-1 border-t border-teal-100 pt-3">
                            {user ? (
                                <>
                                    <Link href="/dashboard" onClick={close} className={`flex min-h-12 items-center text-base ${cls('/dashboard')}`}>Dashboard</Link>
                                    <Link href="/profile" onClick={close} className={`flex min-h-12 items-center text-base ${cls('/profile')}`}>Profile</Link>
                                    <Link href="/logout" method="post" as="button" className={`flex min-h-12 w-full items-center text-base ${link} text-gray-700 hover:bg-teal-50`}>Logout</Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={close} className={`flex min-h-12 items-center text-base ${cls('/login')}`}>Masuk</Link>
                                    <Link href="/register" onClick={close} className="flex min-h-12 items-center justify-center rounded-xl bg-teal-600 font-semibold text-white">Daftar</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main id="main" className="flex-1">{children}</main>

            <footer className="mt-12 border-t border-teal-100 bg-white">
                <div className="mx-auto max-w-5xl space-y-3 px-4 py-8 text-sm text-gray-700">
                    <p className="text-base font-extrabold text-teal-900">ABX GUARD</p>
                    <p>Smart Antibiotic Stewardship &amp; Microbiome Care</p>
                    <p className="font-semibold">Think Before Antibiotics. Protect Your Microbiome.</p>
                    <p className="text-xs text-gray-600">Informasi ABX Guard ditujukan untuk edukasi kesehatan dan tidak menggantikan diagnosis, resep, atau keputusan klinis tenaga kesehatan.</p>
                </div>
            </footer>
        </div>
    );
}
