export default function EducationalCard({ icon, title, children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-teal-100 bg-teal-50/50 p-5 ${className}`}>
            <h4 className="flex items-center gap-2 font-semibold text-teal-950">
                {icon && <span aria-hidden="true" className="text-xl">{icon}</span>}
                {title}
            </h4>
            {children && <div className="mt-2 text-gray-700">{children}</div>}
        </div>
    );
}
