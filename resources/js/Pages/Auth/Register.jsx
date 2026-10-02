import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const inputClass = 'mt-1 block w-full max-w-full rounded-lg border-slate-300 px-3.5 py-3 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-600 focus:ring-emerald-600';
const focusLink = 'rounded-sm text-sm font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2';

function PasswordField({ id, label, value, onChange, error, autoComplete, visible, onToggle }) {
    return (
        <div>
            <InputLabel htmlFor={id} value={label} className="text-slate-700" />
            <div className="relative mt-1">
                <TextInput id={id} type={visible ? 'text' : 'password'} name={id} value={value} className={`${inputClass} pr-24`} autoComplete={autoComplete} onChange={onChange} required />
                <button type="button" onClick={onToggle} aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'} aria-pressed={visible} className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
                    {visible ? 'Sembunyikan' : 'Tampilkan'}
                </button>
            </div>
            <InputError message={error} className="mt-2" role="alert" />
        </div>
    );
}

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (processing) return;

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar | ABX GUARD" />
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Buat akun ABX GUARD</h1>
                <p className="mt-1 text-sm leading-6 text-slate-600">Mulai perjalanan perawatan antibiotik yang bijak.</p>
            </div>

            <form onSubmit={submit} aria-busy={processing}>
                <div>
                    <InputLabel htmlFor="name" value="Nama" className="text-slate-700" />
                    <TextInput id="name" name="name" value={data.name} className={inputClass} autoComplete="name" isFocused onChange={(e) => setData('name', e.target.value)} required />
                    <InputError message={errors.name} className="mt-2" role="alert" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" className="text-slate-700" />
                    <TextInput id="email" type="email" name="email" value={data.email} className={inputClass} autoComplete="username" onChange={(e) => setData('email', e.target.value)} required />
                    <InputError message={errors.email} className="mt-2" role="alert" />
                </div>

                <div className="mt-4">
                    <PasswordField id="password" label="Password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} autoComplete="new-password" visible={showPassword} onToggle={() => setShowPassword((shown) => !shown)} />
                </div>

                <div className="mt-4">
                    <PasswordField id="password_confirmation" label="Konfirmasi Password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} error={errors.password_confirmation} autoComplete="new-password" visible={showConfirmation} onToggle={() => setShowConfirmation((shown) => !shown)} />
                </div>

                <PrimaryButton type="submit" disabled={processing} className="mt-6 flex min-h-12 w-full justify-center rounded-lg bg-emerald-700 px-5 text-sm normal-case tracking-normal shadow-sm hover:bg-emerald-800 focus:bg-emerald-800 focus:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60">
                    {processing ? <><span aria-hidden="true" className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Memproses...</> : 'Daftar'}
                </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">Sudah punya akun? <Link href={route('login')} className={focusLink}>Masuk</Link></p>
        </GuestLayout>
    );
}
