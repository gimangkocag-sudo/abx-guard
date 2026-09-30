import { Link } from '@inertiajs/react';

export default function Card({ href, className = '', children, ...props }) {
    const base = `block rounded-2xl border border-teal-100 bg-white p-6 shadow-sm ${className}`;
    if (!href) return <div className={base} {...props}>{children}</div>;
    return (
        <Link href={href} {...props} className={`${base} transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500`}>
            {children}
        </Link>
    );
}
