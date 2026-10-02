import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f3f8f7] px-4 py-10 text-slate-900 sm:px-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
                <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <Link href="/" className="mb-7 inline-flex rounded-md text-sm font-medium text-slate-600 transition hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-4">
                    ← Kembali ke Beranda
                </Link>

                <header className="mb-7 text-center">
                    <Link href="/" className="inline-flex flex-col items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-4">
                        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/15" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 3.75v3m8-3v3M5.5 8.25h13m-11.25-4.5h9.5A2.25 2.25 0 0 1 19 6v12a2.25 2.25 0 0 1-2.25 2.25h-9.5A2.25 2.25 0 0 1 5 18V6a2.25 2.25 0 0 1 2.25-2.25Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m-3-3h6" />
                            </svg>
                        </span>
                        <span className="text-2xl font-bold tracking-[0.16em] text-slate-900">ABX GUARD</span>
                        <span className="mt-1 text-sm text-slate-600">Smart Antibiotic Stewardship &amp; Microbiome Care</span>
                    </Link>
                </header>

                <section className="w-full rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl shadow-slate-900/5 sm:p-8">
                    {children}
                </section>
                <p className="mt-6 text-center text-xs text-slate-500">Pendamping bijak untuk kesehatan Anda</p>
            </div>
        </main>
    );
}
