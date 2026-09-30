export default function Disclaimer({ children, className = '' }) {
    return (
        <aside role="note" className={`rounded-xl border-l-4 border-teal-500 bg-teal-50 p-4 text-sm text-teal-950 ${className}`}>
            <strong>Penting: </strong>
            {children ?? 'Informasi ABX Guard bersifat edukatif dan tidak menggantikan diagnosis, resep, atau keputusan klinis tenaga kesehatan. Jika keluhan berat, menetap, atau memburuk, konsultasikan dengan tenaga kesehatan.'}
        </aside>
    );
}
