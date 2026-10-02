import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

function PasswordField({ id, label, value, onChange, autoComplete, error }) {
    const [visible, setVisible] = useState(false);
    return (
        <div>
            <InputLabel htmlFor={id} value={label} className="text-slate-700" />
            <div className="relative mt-1">
                <TextInput id={id} type={visible ? 'text' : 'password'} name={id} value={value} className="block w-full max-w-full py-3 pr-24 text-base" autoComplete={autoComplete} onChange={onChange} required />
                <button type="button" onClick={() => setVisible((state) => !state)} aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'} aria-pressed={visible} className="absolute inset-y-0 right-2 my-auto min-h-11 rounded-md px-2 text-sm font-medium text-teal-800 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">{visible ? 'Sembunyikan' : 'Tampilkan'}</button>
            </div>
            <InputError message={error} className="mt-2" role="alert" />
        </div>
    );
}

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({ token, email, password: '', password_confirmation: '' });

    const submit = (event) => {
        event.preventDefault();
        if (processing) return;
        post(route('password.store'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Atur Password Baru | ABX GUARD" />
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Atur password baru</h1>
                <p className="mt-1 text-sm text-slate-600">Gunakan password baru untuk akun ABX GUARD Anda.</p>
            </div>
            <form onSubmit={submit} aria-busy={processing}>
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-slate-700" />
                    <TextInput id="email" type="email" name="email" value={data.email} className="mt-1 block w-full max-w-full py-3 text-base" autoComplete="username" onChange={(event) => setData('email', event.target.value)} required />
                    <InputError message={errors.email} className="mt-2" role="alert" />
                </div>
                <div className="mt-4">
                    <PasswordField id="password" label="Password baru" value={data.password} onChange={(event) => setData('password', event.target.value)} autoComplete="new-password" error={errors.password} />
                </div>
                <div className="mt-4">
                    <PasswordField id="password_confirmation" label="Konfirmasi password baru" value={data.password_confirmation} onChange={(event) => setData('password_confirmation', event.target.value)} autoComplete="new-password" error={errors.password_confirmation} />
                </div>
                <PrimaryButton type="submit" disabled={processing} className="mt-6 w-full justify-center normal-case tracking-normal disabled:cursor-not-allowed">{processing ? 'Menyimpan…' : 'Simpan password baru'}</PrimaryButton>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600"><Link href={route('login')} className="rounded-sm font-medium text-teal-800 underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Kembali ke Masuk</Link></p>
        </GuestLayout>
    );
}
