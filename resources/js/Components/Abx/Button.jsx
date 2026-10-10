import { Link } from '@inertiajs/react';

const styles = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900',
    secondary: 'border border-slate-300 bg-white text-teal-900 hover:border-teal-300 hover:bg-teal-50 active:bg-teal-100',
    ghost: 'text-teal-800 hover:bg-teal-50 active:bg-teal-100',
};

export default function Button({ href, variant = 'primary', className = '', children, ...props }) {
    const cls = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-2 text-center text-sm font-semibold leading-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 ${styles[variant]} ${className}`;
    return href ? (
        <Link href={href} className={cls} {...props}>{children}</Link>
    ) : (
        <button type="button" className={cls} {...props}>{children}</button>
    );
}
