import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

const NAV = [
    ['Dashboard', '/admin', '📊'],
    ['Users', '/admin/users', '👥'],
    ['KAP Survey', '/admin/survey', '📝'],
    ['Statistik', '/admin/statistics', '📈'],
    ['AMR Challenge', '/admin/challenge', '🎯'],
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
            {NAV.map(([label, href, icon]) => (
                <li key={href}>
                    <Link href={href} onClick={() => setOpen(false)} aria-current={active(href) ? 'page' : undefined}
                        className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${active(href) ? 'bg-teal-700 text-white' : 'text-slate-200 hover:bg-slate-700'}`}>
                        <span aria-hidden="true">{icon}</span>{label}
                    </Link>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 lg:flex">
            <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Lewati ke konten</a>

            <aside className="hidden w-60 flex-none bg-slate-900 p-4 lg:block" aria-label="Navigasi admin">
                <p className="mb-6 px-3 text-lg font-extrabold text-white">🛡️ ABX Admin</p>
                {links}
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <button ref={menuButton} type="button" className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 lg:hidden"
                                aria-label={open ? 'Tutup menu admin' : 'Buka menu admin'} aria-expanded={open} aria-controls="admin-mobile-nav" onClick={() => setOpen(!open)}>
                                <span aria-hidden="true">{open ? '✕' : '☰'}</span>
                            </button>
                            <h1 className="text-lg font-bold sm:text-xl">{title}</h1>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="hidden text-slate-600 sm:inline">{props.auth.user.name}</span>
                            <Link href="/" className="rounded-lg px-3 py-2 font-medium text-teal-700 hover:bg-teal-50">Situs</Link>
                            <Link href="/logout" method="post" as="button" className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100">Logout</Link>
                        </div>
                    </div>
                    {open && <nav id="admin-mobile-nav" aria-label="Navigasi admin (mobile)" className="max-h-[80dvh] overflow-y-auto border-t border-slate-200 bg-slate-900 p-3 lg:hidden">{links}</nav>}
                </header>
                <main id="admin-main" className="flex-1 p-4 sm:p-6">
                    {actions && <div className="mb-4 flex flex-wrap gap-2">{actions}</div>}
                    {children}
                </main>
            </div>
        </div>
    );
}
