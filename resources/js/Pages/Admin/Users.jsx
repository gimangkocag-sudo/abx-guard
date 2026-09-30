import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import FilterBar from '@/Components/Admin/FilterBar';
import Pagination from '@/Components/Admin/Pagination';
import EmptyState from '@/Components/Admin/EmptyState';
import { fmtDate } from '@/Components/Admin/util';

const FIELDS = [
    { name: 'q', label: 'Cari nama atau email', type: 'text', placeholder: 'mis. budi@' },
    { name: 'role', label: 'Role', type: 'select', options: [{ value: '', label: 'Semua role' }, { value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }] },
];

export default function Users({ users, pagination, filters, surveyVersion }) {
    return (
        <AdminLayout title="Users">
            <Head title="Admin — Users" />
            <FilterBar action="/admin/users" values={filters} fields={FIELDS} />
            {users.length === 0 ? <EmptyState title="Tidak ada user yang cocok">Ubah kata kunci atau filter role.</EmptyState> : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50"><tr>{['Nama', 'Email', 'Role', 'Terdaftar', `KAP Survey (v${surveyVersion})`, 'Challenge'].map((h) => <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="px-4 py-3 font-medium">{u.name}</td>
                                    <td className="px-4 py-3">{u.email}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>{u.role}</span></td>
                                    <td className="px-4 py-3">{fmtDate(u.registeredAt)}</td>
                                    <td className="px-4 py-3">{u.kapDone ? '✓ Sudah diisi' : '✗ Belum diisi'}</td>
                                    <td className="px-4 py-3">{u.attempts}× attempt</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination meta={pagination} />
        </AdminLayout>
    );
}
