import { forwardRef, useState } from 'react';
import TextInput from '@/Components/TextInput';

export default forwardRef(function PasswordInput({ className = '', ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative mt-1">
            <TextInput {...props} ref={ref} type={visible ? 'text' : 'password'} className={`${className} pr-24`} />
            <button type="button" onClick={() => setVisible((state) => !state)} aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'} aria-pressed={visible} className="absolute inset-y-0 right-2 my-auto min-h-11 rounded-md px-2 text-sm font-medium text-teal-800 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
                {visible ? 'Sembunyikan' : 'Tampilkan'}
            </button>
        </div>
    );
});
