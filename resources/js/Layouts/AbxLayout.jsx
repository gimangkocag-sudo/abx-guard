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

const link = 'min-h-11 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2';

function BrandMark() {
    return (
        <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 flex-none">
            <path d="M16 2.5 28 7v8.2c0 7.1-4.8 12-12 14.3C8.8 27.2 4 22.3 4 15.2V7l12-4.5Z" fill="#1769AA" />
            <path d="m10.5 15.8 3.6 3.6 7.5-7.5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

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
            <button ref={buttonRef} type="button" aria-haspopup="true" aria-expanded={open} aria-controls="learn-menu-options" onClick={() => setOpen((value) => !value)} className={`${link} ${isActive('/belajar') ? 'relative font-semibold text-teal-950 after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-teal-600' : 'text-slate-700 hover:bg-teal-50'}`}>
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
    const { auth, canAccessPharmacistInbox } = usePage().props;
    const user = auth?.user;
    const isActive = useActive();
    const [menu, setMenu] = useState(false);
    const menuButtonRef = useRef(null);
    const cls = (href) => `${link} ${isActive(href) ? 'relative font-semibold text-teal-950 after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-teal-600' : 'text-slate-700 hover:bg-teal-50'}`;
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
        <div className="flex min-h-screen flex-col bg-abx-background text-slate-900">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Lewati ke konten</a>
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
                <nav aria-label="Navigasi utama" className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
                    <Link href="/" className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg text-base font-extrabold tracking-tight text-teal-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:text-lg">
                        <BrandMark /> ABX GUARD
                    </Link>

                    <div className="hidden items-center gap-0.5 lg:flex">
                        <Link href="/" aria-current={isActive('/') ? 'page' : undefined} className={cls('/')}>Beranda</Link>
                        <Link href="/cek-keluhan" aria-current={isActive('/cek-keluhan') ? 'page' : undefined} className={cls('/cek-keluhan')}>Cek Keluhan</Link>
                        <LearnMenu isActive={isActive} />
                        <Link href="/amr-challenge" aria-current={isActive('/amr-challenge') ? 'page' : undefined} className={cls('/amr-challenge')}>AMR Challenge</Link>
                        {user && <Link href="/survei-penelitian" aria-current={isActive('/survei-penelitian') ? 'page' : undefined} className={cls('/survei-penelitian')}>Survei Penelitian</Link>}
                    </div>

                    <div className="hidden items-center gap-0.5 border-l border-slate-200 pl-2 lg:flex">
                        {user ? (
                            <>
                                <Link href="/dashboard" aria-current={isActive('/dashboard') ? 'page' : undefined} className={cls('/dashboard')}>Dashboard</Link>
                                {canAccessPharmacistInbox && <Link href="/pharmacist/inbox" aria-current={isActive('/pharmacist/inbox') ? 'page' : undefined} className={cls('/pharmacist/inbox')}>Inbox Apoteker</Link>}
                                <Link href="/profile" aria-current={isActive('/profile') ? 'page' : undefined} className={cls('/profile')}>Profil</Link>
                                <Link {...logoutProps} className={`${link} text-slate-600 hover:bg-slate-100 hover:text-slate-950`}>Keluar</Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className={cls('/login')}>Masuk</Link>
                                <Link href="/register" className="ml-1 inline-flex min-h-11 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">Daftar</Link>
                            </>
                        )}
                    </div>

                    <button ref={menuButtonRef} type="button" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-teal-900 transition-colors hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 lg:hidden" aria-label={menu ? 'Tutup menu' : 'Buka menu'} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu((value) => !value)}>
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            {menu ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </nav>

                {menu && (
                    <nav id="mobile-menu" aria-label="Menu situs" className="max-h-[80dvh] overflow-y-auto border-t border-slate-200 bg-white px-4 pb-3 lg:hidden">
                        <ul className="space-y-0.5 pt-2">
                            {[['Beranda', '/'], ['Cek Keluhan', '/cek-keluhan']].map(([label, href]) => (
                                <li key={href}><Link href={href} onClick={close} aria-current={isActive(href) ? 'page' : undefined} className={`flex min-h-11 items-center text-sm ${cls(href)}`}>{label}</Link></li>
                            ))}
                            {user && <li><Link href="/survei-penelitian" onClick={close} aria-current={isActive('/survei-penelitian') ? 'page' : undefined} className={`flex min-h-11 items-center text-sm ${cls('/survei-penelitian')}`}>Survei Penelitian</Link></li>}
                            <li>
                                <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wider text-teal-800">Materi</p>
                                <ul>
                                    {LEARN.map(([label, href]) => <li key={href}><Link href={href} onClick={close} aria-current={isActive(href) ? 'page' : undefined} className={`flex min-h-11 items-center pl-6 text-sm ${cls(href)}`}>{label}</Link></li>)}
                                </ul>
                            </li>
                            {[['AMR Challenge', '/amr-challenge']].map(([label, href]) => (
                                <li key={href}><Link href={href} onClick={close} aria-current={isActive(href) ? 'page' : undefined} className={`flex min-h-11 items-center text-sm ${cls(href)}`}>{label}</Link></li>
                            ))}
                        </ul>
                        <div className="mt-2 space-y-0.5 border-t border-slate-200 pt-2">
                            {user ? (
                                <>
                                    <Link href="/dashboard" onClick={close} aria-current={isActive('/dashboard') ? 'page' : undefined} className={`flex min-h-11 items-center text-sm ${cls('/dashboard')}`}>Dashboard</Link>
                                    {canAccessPharmacistInbox && <Link href="/pharmacist/inbox" onClick={close} aria-current={isActive('/pharmacist/inbox') ? 'page' : undefined} className={`flex min-h-11 items-center text-sm ${cls('/pharmacist/inbox')}`}>Inbox Apoteker</Link>}
                                    <Link href="/profile" onClick={close} aria-current={isActive('/profile') ? 'page' : undefined} className={`flex min-h-11 items-center text-sm ${cls('/profile')}`}>Profil</Link>
                                    <Link {...logoutProps} className={`flex min-h-11 w-full items-center text-sm ${link} text-slate-600 hover:bg-slate-100 hover:text-slate-950`}>Keluar</Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={close} className={`flex min-h-11 items-center text-sm ${cls('/login')}`}>Masuk</Link>
                                    <Link href="/register" onClick={close} className="flex min-h-12 items-center justify-center rounded-xl bg-teal-700 font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Daftar</Link>
                                </>
                            )}
                        </div>
                    </nav>
                )}
            </header>

            <main id="main" className="min-w-0 flex-1">{children}</main>
            <footer className="mt-10 border-t border-slate-200 bg-white">
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
