import AbxLayout from '@/Layouts/AbxLayout';

export default function AuthenticatedLayout({ header, children }) {
    return (
        <AbxLayout>
            {header && (
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:py-6">
                        {header}
                    </div>
                </header>
            )}
            {children}
        </AbxLayout>
    );
}
