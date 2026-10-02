import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PasswordInput from '@/Components/PasswordInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Hapus akun
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Penghapusan akun akan menghapus data akun secara permanen. Pastikan Anda telah menyimpan informasi yang masih diperlukan.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                Hapus akun
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Yakin ingin menghapus akun?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        Tindakan ini tidak dapat dibatalkan. Masukkan password untuk mengonfirmasi penghapusan akun.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <PasswordInput
                            id="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-full max-w-full py-3 text-base"
                            isFocused
                            placeholder="Password"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={closeModal}>
                                Batal
                        </SecondaryButton>

                            <DangerButton type="submit" className="ms-3" disabled={processing}>
                                {processing ? 'Menghapus…' : 'Hapus akun'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
