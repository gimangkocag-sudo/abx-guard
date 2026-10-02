import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformationForm({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({ name: user.name, email: user.email });

    const submit = (event) => {
        event.preventDefault();
        if (!processing) patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-slate-900">Informasi profil</h2>
                <p className="mt-1 text-sm text-slate-600">Perbarui nama dan alamat email pada akun Anda.</p>
            </header>
            <form onSubmit={submit} aria-busy={processing} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nama" />
                    <TextInput id="name" className="mt-1 block w-full max-w-full py-3 text-base" value={data.name} onChange={(event) => setData('name', event.target.value)} required isFocused autoComplete="name" />
                    <InputError className="mt-2" message={errors.name} role="alert" />
                </div>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput id="email" type="email" className="mt-1 block w-full max-w-full py-3 text-base" value={data.email} onChange={(event) => setData('email', event.target.value)} required autoComplete="username" />
                    <InputError className="mt-2" message={errors.email} role="alert" />
                </div>
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm text-slate-800">Alamat email Anda belum diverifikasi.</p>
                        <Link href={route('verification.send')} method="post" as="button" className="mt-1 min-h-11 rounded-sm text-sm text-teal-800 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Kirim ulang email verifikasi</Link>
                        {status === 'verification-link-sent' && <p role="status" className="mt-2 text-sm font-medium text-emerald-800">Tautan verifikasi baru telah dikirim ke email Anda.</p>}
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-4">
                    <PrimaryButton disabled={processing}>{processing ? 'Menyimpan…' : 'Simpan perubahan'}</PrimaryButton>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p role="status" className="text-sm text-emerald-800">Perubahan tersimpan.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
