export default function PageContainer({ className = '', children }) {
    return <div className={`mx-auto w-full max-w-5xl px-4 py-8 sm:py-12 ${className}`}>{children}</div>;
}
