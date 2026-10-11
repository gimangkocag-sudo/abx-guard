import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import FilterBar from '@/Components/Admin/FilterBar';
import Pagination from '@/Components/Admin/Pagination';
import EmptyState from '@/Components/Admin/EmptyState';
import { fmtDate } from '@/Components/Admin/util';

const FIELDS = [
    { name: 'q', label: 'Cari nama atau email', type: 'text', placeholder: 'mis. budi@' },
    { name: 'role', label: 'Role', type: 'select', options: [{ value: '', label: 'Semua role' }, { value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }] },
    { name: 'staff', label: 'Akses staf', type: 'select', options: [{ value: '', label: 'Semua status staf' }, { value: 'active', label: 'Staf aktif' }, { value: 'inactive', label: 'Akses nonaktif' }, { value: 'none', label: 'Belum ditetapkan' }] },
];

const STAFF_STATUS = {
    active: { label: 'Staf aktif', className: 'bg-emerald-100 text-emerald-900' },
    inactive: { label: 'Akses nonaktif', className: 'bg-slate-100 text-slate-700' },
    none: { label: 'Belum ditetapkan', className: 'bg-amber-100 text-amber-900' },
};

const buttonClass = 'inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60';

function StaffAccess({ user, busy, onChange }) {
    const status = STAFF_STATUS[user.pharmacistStaffStatus] ?? STAFF_STATUS.none;

    return (
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <span className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold ${status.className}`}>
                {status.label}
            </span>
            {user.pharmacistStaffStatus === 'active' ? (
                    <button type="button" disabled={busy} onClick={() => onChange(user, false)} className={`${buttonClass} border border-rose-300 text-rose-800 hover:bg-rose-50`}>
                        {busy ? 'Menyimpan…' : 'Nonaktifkan Akses Staf'}
                    </button>
                ) : (
                    <button type="button" disabled={busy} onClick={() => onChange(user, true)} className={`${buttonClass} bg-blue-700 text-white hover:bg-blue-800`}>
                        {busy ? 'Menyimpan…' : 'Jadikan Staf'}
                    </button>
                )}
        </div>
    );
}

function Notice({ type = 'info', children }) {
    const styles = {
        success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
        warning: 'border-amber-300 bg-amber-50 text-amber-950',
        error: 'border-rose-200 bg-rose-50 text-rose-950',
        info: 'border-blue-200 bg-[#DCEEFF] text-[#163B70]',
    };
    return <p role={type === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-xl border p-3 text-sm leading-6 ${styles[type]}`}>{children}</p>;
}

export default function Users({ users, pagination, filters, instrumentVersion, activePharmacistStaffCount, consultationOperational, consultationGateConfigured }) {
    const { flash = {} } = usePage().props;
    const [busyUserId, setBusyUserId] = useState(null);
    const [mutationError, setMutationError] = useState('');

    const changeStaffAccess = (user, grant) => {
        const action = grant ? 'memberikan' : 'mencabut';
        const effect = grant ? 'Akses inbox hanya boleh diberikan kepada petugas yang sudah disetujui untuk bertugas. Ini bukan verifikasi kualifikasi apoteker.' : 'Percakapan aktif akan dikembalikan ke antrean staf. Riwayat pesan tidak dihapus.';
        const lastStaffWarning = !grant && user.pharmacistStaffStatus === 'active' && activePharmacistStaffCount === 1 && consultationGateConfigured
            ? '\n\nIni adalah staf aktif terakhir. Konsultasi publik akan berhenti menerima pesan sampai ada staf aktif.'
            : '';
        if (!window.confirm(`Yakin ${action} akses staf untuk ${user.name} (${user.email})?\n\n${effect}${lastStaffWarning}`)) return;

        setMutationError('');
        setBusyUserId(user.id);
        const options = {
            preserveScroll: true,
            onError: () => setMutationError('Perubahan akses staf gagal disimpan. Muat ulang daftar dan coba lagi.'),
            onFinish: () => setBusyUserId(null),
        };
        const url = `/admin/users/${user.id}/pharmacist-staff`;
        if (grant) router.put(url, {}, options);
        else router.delete(url, options);
    };

    return (
        <AdminLayout title="Users">
            <Head title="Admin — Users" />
            <Notice type="info">Status survei merujuk ke tahap awal instrumen penelitian aktif (v{instrumentVersion ?? '—'}). Akses inbox adalah izin teknis terpisah dari role admin, bukan bukti kualifikasi apoteker; berikan hanya kepada staf yang telah disetujui untuk bertugas.</Notice>
            {flash.success && <Notice type="success">{flash.success}</Notice>}
            {flash.warning && <Notice type="warning">{flash.warning}</Notice>}
            {mutationError && <Notice type="error">{mutationError}</Notice>}
            {consultationGateConfigured && !consultationOperational && activePharmacistStaffCount === 0 && (
                <Notice type="warning">Gate konsultasi terkonfigurasi aktif, tetapi tidak ada staf inbox aktif. Penerimaan pesan dinonaktifkan secara efektif sampai staf yang disetujui diaktifkan.</Notice>
            )}
            <p className="mb-4 text-sm text-slate-700">Staf inbox aktif: <strong>{activePharmacistStaffCount}</strong>. Status layanan efektif: <strong>{consultationOperational ? 'operasional' : 'nonaktif'}</strong>.</p>
            <FilterBar action="/admin/users" values={filters} fields={FIELDS} />
            {users.length === 0 ? <EmptyState title="Tidak ada user yang cocok">Ubah kata kunci atau filter.</EmptyState> : (
                <>
                    <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white md:block">
                        <table className="w-full min-w-[1050px] text-sm">
                            <thead className="bg-slate-50"><tr>{['Nama', 'Email', 'Role', 'Terdaftar', `Survei penelitian awal (v${instrumentVersion ?? '—'})`, 'Challenge', 'Staf Pharmacist Connect'].map((h) => <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td className="px-4 py-3 font-medium">{u.name}</td>
                                        <td className="px-4 py-3">{u.email}</td>
                                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>{u.role}</span></td>
                                        <td className="px-4 py-3">{fmtDate(u.registeredAt)}</td>
                                        <td className="px-4 py-3">{u.researchInitialDone ? '✓ Sudah diisi' : '— Belum diisi'}</td>
                                        <td className="px-4 py-3">{u.attempts}× attempt</td>
                                        <td className="px-4 py-3"><StaffAccess user={u} busy={busyUserId === u.id} onChange={changeStaffAccess} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="space-y-3 md:hidden">
                        {users.map((u) => (
                            <article key={u.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <h2 className="break-words font-semibold text-slate-900">{u.name}</h2>
                                <p className="mt-1 break-all text-sm text-slate-700">{u.email}</p>
                                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                                    <div><dt className="text-xs text-slate-500">Role</dt><dd className="mt-0.5 font-medium">{u.role}</dd></div>
                                    <div><dt className="text-xs text-slate-500">Terdaftar</dt><dd className="mt-0.5">{fmtDate(u.registeredAt)}</dd></div>
                                    <div><dt className="text-xs text-slate-500">Survei awal</dt><dd className="mt-0.5">{u.researchInitialDone ? 'Sudah diisi' : 'Belum diisi'}</dd></div>
                                    <div><dt className="text-xs text-slate-500">Challenge</dt><dd className="mt-0.5">{u.attempts}× attempt</dd></div>
                                </dl>
                                <div className="mt-4 border-t border-slate-100 pt-3">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Staf Pharmacist Connect</p>
                                    <StaffAccess user={u} busy={busyUserId === u.id} onChange={changeStaffAccess} />
                                </div>
                            </article>
                        ))}
                    </div>
                </>
            )}
            <Pagination meta={pagination} />
        </AdminLayout>
    );
}
