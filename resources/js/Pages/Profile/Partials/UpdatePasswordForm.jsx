import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PasswordInput from '@/Components/PasswordInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef(null);
    const currentPasswordInput = useRef(null);
    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({ current_password: '', password: '', password_confirmation: '' });

    const updatePassword = (event) => {
        event.preventDefault();
        if (processing) return;
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (formErrors) => {
                if (formErrors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (formErrors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-slate-900">Ubah password</h2>
                <p className="mt-1 text-sm text-slate-600">Gunakan password yang kuat dan tidak digunakan pada akun lain.</p>
            </header>
            <form onSubmit={updatePassword} aria-busy={processing} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="current_password" value="Password saat ini" />
                    <PasswordInput id="current_password" ref={currentPasswordInput} value={data.current_password} onChange={(event) => setData('current_password', event.target.value)} className="block w-full max-w-full py-3 text-base" autoComplete="current-password" />
                    <InputError message={errors.current_password} className="mt-2" role="alert" />
                </div>
                <div>
                    <InputLabel htmlFor="password" value="Password baru" />
                    <PasswordInput id="password" ref={passwordInput} value={data.password} onChange={(event) => setData('password', event.target.value)} className="block w-full max-w-full py-3 text-base" autoComplete="new-password" />
                    <InputError message={errors.password} className="mt-2" role="alert" />
                </div>
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi password baru" />
                    <PasswordInput id="password_confirmation" value={data.password_confirmation} onChange={(event) => setData('password_confirmation', event.target.value)} className="block w-full max-w-full py-3 text-base" autoComplete="new-password" />
                    <InputError message={errors.password_confirmation} className="mt-2" role="alert" />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <PrimaryButton disabled={processing}>{processing ? 'Menyimpan…' : 'Simpan password'}</PrimaryButton>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p role="status" className="text-sm text-emerald-800">Password tersimpan.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
