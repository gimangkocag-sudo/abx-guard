import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-teal-700 text-teal-950 focus:border-teal-800'
                    : 'border-transparent text-slate-600 hover:border-teal-300 hover:text-teal-900 focus-visible:ring-2 focus-visible:ring-teal-600') +
                className
            }
        >
            {children}
        </Link>
    );
}
