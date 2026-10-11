import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

const NAV = [
    ['Dashboard', '/admin'],
    ['Users', '/admin/users'],
    ['Survei Penelitian', '/admin/research-survey'],
    ['Histori KAP', '/admin/survey'],
    ['Statistik KAP historis', '/admin/statistics'],
    ['AMR Challenge', '/admin/challenge'],
];

export default function AdminLayout({ title, actions, children }) {
    const { url, props } = usePage();
    const path = url.split('?')[0];
    const [open, setOpen] = useState(false);
    const menuButton = useRef(null);
    const active = (href) => (href === '/admin' ? path === '/admin' : path === href || path.startsWith(`${href}/`));

    useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
                menuButton.current?.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open]);

    const links = (
        <ul className="space-y-1">
            {NAV.map(([label, href]) => (
                <li key={href}>
                    <Link href={href} onClick={() => setOpen(false)} aria-current={active(href) ? 'page' : undefined}
                        className={`flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 ${active(href) ? 'bg-teal-800 text-white' : 'text-slate-200 hover:bg-slate-800'}`}>
                        {label}
                    </Link>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="min-h-screen bg-abx-background text-slate-900 lg:flex">
            <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Lewati ke konten</a>

            <aside className="hidden w-60 flex-none bg-teal-950 p-4 lg:block" aria-label="Navigasi admin">
                <div className="mb-6 flex min-h-11 items-center gap-2 px-3 text-white">
                    <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 flex-none"><path d="M16 2.5 28 7v8.2c0 7.1-4.8 12-12 14.3C8.8 27.2 4 22.3 4 15.2V7l12-4.5Z" fill="#1769AA" /><path d="m10.5 15.8 3.6 3.6 7.5-7.5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <p className="text-base font-bold tracking-tight">ABX GUARD <span className="font-medium text-teal-200">Admin</span></p>
                </div>
                {links}
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
                    <div className="mx-auto flex min-h-[4.25rem] max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-3">
                            <button ref={menuButton} type="button" className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-teal-900 transition-colors hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 lg:hidden"
                                aria-label={open ? 'Tutup menu admin' : 'Buka menu admin'} aria-expanded={open} aria-controls="admin-mobile-nav" onClick={() => setOpen(!open)}>
                                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                    {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                                </svg>
                            </button>
                            <h1 className="text-lg font-bold sm:text-xl">{title}</h1>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                            <span className="hidden text-slate-600 sm:inline">{props.auth.user.name}</span>
                            <Link href="/" className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-teal-800 transition-colors hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Situs</Link>
                            <Link href="/logout" method="post" as="button" className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Logout</Link>
                        </div>
                    </div>
                    {open && <nav id="admin-mobile-nav" aria-label="Navigasi admin (mobile)" className="max-h-[80dvh] overflow-y-auto border-t border-teal-900 bg-teal-950 p-3 lg:hidden">{links}</nav>}
                </header>
                <main id="admin-main" className="min-w-0 flex-1 p-4 sm:p-6">
                    {actions && <div className="mb-4 flex flex-wrap gap-2">{actions}</div>}
                    {children}
                </main>
            </div>
        </div>
    );
}
