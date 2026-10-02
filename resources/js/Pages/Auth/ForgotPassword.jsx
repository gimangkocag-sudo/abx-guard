import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (event) => {
        event.preventDefault();
        if (processing) return;
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Password | ABX GUARD" />
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Lupa password?</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">Masukkan alamat email akun Anda. Jika akun ditemukan, kami akan mengirimkan tautan untuk mengatur password baru.</p>
            </div>

            {status && <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{status}</p>}

            <form onSubmit={submit} aria-busy={processing}>
                <InputLabel htmlFor="email" value="Email" className="text-slate-700" />
                <TextInput id="email" type="email" name="email" value={data.email} className="mt-1 block w-full max-w-full px-3.5 py-3 text-base" autoComplete="username" isFocused onChange={(event) => setData('email', event.target.value)} required />
                <InputError message={errors.email} className="mt-2" role="alert" />
                <PrimaryButton type="submit" disabled={processing} className="mt-6 w-full justify-center normal-case tracking-normal disabled:cursor-not-allowed">
                    {processing ? 'Mengirim…' : 'Kirim tautan reset password'}
                </PrimaryButton>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600"><Link href={route('login')} className="rounded-sm font-medium text-teal-800 underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Kembali ke Masuk</Link></p>
        </GuestLayout>
    );
}
