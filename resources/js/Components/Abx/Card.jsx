import { Link } from '@inertiajs/react';

export default function Card({ href, className = '', children, ...props }) {
    const base = `rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`;
    if (!href) return <div className={base} {...props}>{children}</div>;
    return (
        <Link href={href} {...props} className={`block ${base} transition-colors hover:border-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2`}>
            {children}
        </Link>
    );
}
