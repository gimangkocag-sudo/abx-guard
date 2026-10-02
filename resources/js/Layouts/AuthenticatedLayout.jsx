import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth?.user;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuButton = useRef(null);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
                menuButton.current?.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [menuOpen]);

    return (
        <div className="min-h-screen bg-[#f3f8f7] text-slate-900">
            <a href="#profile-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Lewati ke konten</a>
            <nav aria-label="Navigasi akun" className="border-b border-teal-100 bg-white">
                <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex min-h-11 items-center rounded-lg text-lg font-extrabold tracking-wide text-teal-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">ABX GUARD</Link>
                        <div className="hidden sm:flex">
                            <NavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</NavLink>
                        </div>
                    </div>

                    <div className="hidden items-center sm:flex">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button type="button" className="inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
                                    {user?.name ?? 'Akun'}
                                    <svg aria-hidden="true" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profil</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Keluar</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>

                    <button ref={menuButton} type="button" aria-label={menuOpen ? 'Tutup menu akun' : 'Buka menu akun'} aria-expanded={menuOpen} aria-controls="account-mobile-menu" onClick={() => setMenuOpen((open) => !open)} className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-200 text-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:hidden">
                        <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
                    </button>
                </div>

                {menuOpen && (
                    <div id="account-mobile-menu" className="max-h-[80dvh] overflow-y-auto border-t border-teal-100 bg-white px-4 pb-3 sm:hidden">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</ResponsiveNavLink>
                        <div className="border-t border-slate-200 pb-1 pt-4">
                            <p className="px-4 text-base font-medium text-slate-800">{user?.name}</p>
                            <p className="px-4 text-sm text-slate-600">{user?.email}</p>
                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>Profil</ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route('logout')} as="button">Keluar</ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {header && <header className="border-b border-teal-100 bg-white"><div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{header}</div></header>}
            <main id="profile-main">{children}</main>
        </div>
    );
}
