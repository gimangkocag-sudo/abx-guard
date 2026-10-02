import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

const LEARN = [
    ['Bijak Antibiotik', '/belajar/bijak-antibiotik'],
    ['Edukasi AMR', '/belajar/amr'],
    ['Perawatan Mikrobioma', '/belajar/mikrobioma'],
    ['Pangan Fungsional', '/belajar/pangan-fungsional'],
    ['Tanya Apoteker', '/belajar/pharmacist-connect'],
    ['Mitos atau Fakta', '/belajar/myth-or-fact'],
];

const link = 'min-h-11 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2';

function useActive() {
    const { url } = usePage();
    const path = url.split('?')[0];
    return (href) => href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
}

function LearnMenu({ isActive }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const buttonRef = useRef(null);
    useEffect(() => {
        const onPointerDown = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
        const onKeyDown = (event) => {
            if (event.key === 'Escape' && open) {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button ref={buttonRef} type="button" aria-haspopup="true" aria-expanded={open} aria-controls="learn-menu-options" onClick={() => setOpen((value) => !value)} className={`${link} ${isActive('/belajar') ? 'bg-teal-100 text-teal-950' : 'text-gray-700 hover:bg-teal-50'}`}>
                Materi <span aria-hidden="true">▾</span>
            </button>
            {open && (
                <ul id="learn-menu-options" className="absolute left-0 z-20 mt-2 w-60 rounded-xl border border-teal-100 bg-white p-2 shadow-lg">
                    {LEARN.map(([label, href]) => (
                        <li key={href}><Link href={href} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">{label}</Link></li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function AbxLayout({ children, onLogout = () => {} }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isActive = useActive();
    const [menu, setMenu] = useState(false);
    const menuButtonRef = useRef(null);
    const cls = (href) => `${link} ${isActive(href) ? 'bg-teal-100 text-teal-950' : 'text-gray-700 hover:bg-teal-50'}`;
    const close = () => setMenu(false);

    useEffect(() => {
        if (!menu) return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setMenu(false);
                menuButtonRef.current?.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [menu]);

    const clearCurrentSurveyDraft = () => {
        try {
            const prefix = `abx_kap_answers_${user?.id}_`;
            Object.keys(sessionStorage).filter((key) => key.startsWith(prefix)).forEach((key) => sessionStorage.removeItem(key));
        } catch { /* storage tidak tersedia */ }
        onLogout();
    };
    const logoutProps = { href: '/logout', method: 'post', as: 'button', onSuccess: clearCurrentSurveyDraft, onClick: close };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-teal-50/70 via-white to-white text-gray-900">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Lewati ke konten</a>
            <header className="sticky top-0 z-30 border-b border-teal-100 bg-white/95 backdrop-blur">
                <nav aria-label="Navigasi utama" className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
                    <Link href="/" className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg text-lg font-extrabold tracking-tight text-teal-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
                        <span aria-hidden="true">🛡️</span> ABX GUARD
                    </Link>

                    <div className="hidden items-center gap-1 xl:flex">
                        <Link href="/" aria-current={isActive('/') ? 'page' : undefined} className={cls('/')}>Beranda</Link>
                        <Link href="/cek-keluhan" aria-current={isActive('/cek-keluhan') ? 'page' : undefined} className={cls('/cek-keluhan')}>Cek Keluhan</Link>
                        <LearnMenu isActive={isActive} />
                        <Link href="/amr-challenge" className={cls('/amr-challenge')}>AMR Challenge</Link>
                        <Link href="/kap-survey" className={cls('/kap-survey')}>Survei KAP</Link>
                    </div>

                    <div className="hidden items-center gap-1 xl:flex">
                        {user ? (
                            <>
                                <Link href="/dashboard" className={cls('/dashboard')}>Dashboard</Link>
                                <Link href="/profile" className={cls('/profile')}>Profil</Link>
                                <Link {...logoutProps} className={`${link} text-gray-700 hover:bg-teal-50`}>Keluar</Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className={cls('/login')}>Masuk</Link>
                                <Link href="/register" className="ml-1 inline-flex min-h-11 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">Daftar</Link>
                            </>
                        )}
                    </div>

                    <button ref={menuButtonRef} type="button" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-teal-200 text-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 xl:hidden" aria-label={menu ? 'Tutup menu' : 'Buka menu'} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu((value) => !value)}>
                        <span aria-hidden="true">{menu ? '×' : '☰'}</span>
                    </button>
                </nav>

                {menu && (
                    <div id="mobile-menu" className="max-h-[80dvh] overflow-y-auto border-t border-teal-100 bg-white px-4 pb-4 xl:hidden">
                        <ul className="space-y-1 pt-3">
                            {[['Beranda', '/'], ['Cek Keluhan', '/cek-keluhan']].map(([label, href]) => (
                                <li key={href}><Link href={href} onClick={close} className={`flex min-h-12 items-center text-base ${cls(href)}`}>{label}</Link></li>
                            ))}
                            <li>
                                <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-teal-800">Materi</p>
                                <ul>
                                    {LEARN.map(([label, href]) => <li key={href}><Link href={href} onClick={close} className={`flex min-h-12 items-center pl-6 text-base ${cls(href)}`}>{label}</Link></li>)}
                                </ul>
                            </li>
                            {[['AMR Challenge', '/amr-challenge'], ['Survei KAP', '/kap-survey']].map(([label, href]) => (
                                <li key={href}><Link href={href} onClick={close} className={`flex min-h-12 items-center text-base ${cls(href)}`}>{label}</Link></li>
                            ))}
                        </ul>
                        <div className="mt-3 space-y-1 border-t border-teal-100 pt-3">
                            {user ? (
                                <>
                                    <Link href="/dashboard" onClick={close} className={`flex min-h-12 items-center text-base ${cls('/dashboard')}`}>Dashboard</Link>
                                    <Link href="/profile" onClick={close} className={`flex min-h-12 items-center text-base ${cls('/profile')}`}>Profil</Link>
                                    <Link {...logoutProps} className={`flex min-h-12 w-full items-center text-base ${link} text-gray-700 hover:bg-teal-50`}>Keluar</Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={close} className={`flex min-h-12 items-center text-base ${cls('/login')}`}>Masuk</Link>
                                    <Link href="/register" onClick={close} className="flex min-h-12 items-center justify-center rounded-xl bg-teal-700 font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Daftar</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main id="main" className="min-w-0 flex-1">{children}</main>
            <footer className="mt-12 border-t border-teal-100 bg-white">
                <div className="mx-auto max-w-5xl space-y-3 px-4 py-8 text-sm text-gray-700">
                    <p className="text-base font-extrabold text-teal-950">ABX GUARD</p>
                    <p>Smart Antibiotic Stewardship &amp; Microbiome Care</p>
                    <p className="font-semibold">Think Before Antibiotics. Protect Your Microbiome.</p>
                    <p className="text-xs text-gray-700">Informasi ABX Guard ditujukan untuk edukasi kesehatan dan tidak menggantikan diagnosis, resep, atau keputusan klinis tenaga kesehatan.</p>
                </div>
            </footer>
        </div>
    );
}
