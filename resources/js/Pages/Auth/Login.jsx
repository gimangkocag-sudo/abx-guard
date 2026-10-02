import { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const inputClass = 'mt-1 block w-full max-w-full rounded-lg border-slate-300 px-3.5 py-3 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-600 focus:ring-emerald-600';
const focusLink = 'rounded-sm text-sm font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        if (processing) return;

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk | ABX GUARD" />
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Masuk ke akun Anda</h1>
                <p className="mt-1 text-sm leading-6 text-slate-600">Lanjutkan perjalanan perawatan antibiotik yang bijak.</p>
            </div>

            {status && <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{status}</div>}

            <form onSubmit={submit} aria-busy={processing}>
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-slate-700" />
                    <TextInput id="email" type="email" name="email" value={data.email} className={inputClass} autoComplete="username" isFocused onChange={(e) => setData('email', e.target.value)} required />
                    <InputError message={errors.email} className="mt-2" role="alert" />
                </div>

                <div className="mt-5">
                    <InputLabel htmlFor="password" value="Password" className="text-slate-700" />
                    <div className="relative mt-1">
                        <TextInput id="password" type={showPassword ? 'text' : 'password'} name="password" value={data.password} className={`${inputClass} pr-24`} autoComplete="current-password" onChange={(e) => setData('password', e.target.value)} required />
                        <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} aria-pressed={showPassword} className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
                            {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" role="alert" />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <label htmlFor="remember" className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                        <Checkbox id="remember" name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} className="text-emerald-700 focus:ring-emerald-600" />
                        Ingat saya
                    </label>
                    {canResetPassword && <Link href={route('password.request')} className={focusLink}>Lupa password?</Link>}
                </div>

                <PrimaryButton type="submit" disabled={processing} className="mt-6 flex min-h-12 w-full justify-center rounded-lg bg-emerald-700 px-5 text-sm normal-case tracking-normal shadow-sm hover:bg-emerald-800 focus:bg-emerald-800 focus:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60">
                    {processing ? <><span aria-hidden="true" className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Memproses...</> : 'Login'}
                </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">Belum punya akun? <Link href={route('register')} className={focusLink}>Daftar</Link></p>
        </GuestLayout>
    );
}
