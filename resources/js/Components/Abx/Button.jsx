import { Link } from '@inertiajs/react';

const styles = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800',
    secondary: 'border border-teal-200 bg-white text-teal-800 hover:bg-teal-50',
    ghost: 'text-teal-700 hover:bg-teal-50',
};

export default function Button({ href, variant = 'primary', className = '', children, ...props }) {
    const cls = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-2 text-center font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`;
    return href ? (
        <Link href={href} className={cls} {...props}>{children}</Link>
    ) : (
        <button type="button" className={cls} {...props}>{children}</button>
    );
}
