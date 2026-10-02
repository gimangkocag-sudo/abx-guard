import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-teal-700 bg-teal-50 text-teal-950 focus:border-teal-800 focus:bg-teal-100'
                    : 'border-transparent text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-950 focus:border-teal-400 focus:bg-teal-50 focus:text-teal-950'
            } min-h-12 items-center text-base font-medium transition duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${className}`}
        >
            {children}
        </Link>
    );
}
