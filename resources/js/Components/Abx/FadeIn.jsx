import { useEffect, useState } from 'react';

/** Animasi masuk ringan (opacity + geser kecil); otomatis tanpa transisi jika pengguna memilih reduced motion. */
export default function FadeIn({ children, className = '' }) {
    const [on, setOn] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setOn(true));
        return () => cancelAnimationFrame(id);
    }, []);
    return (
        <div className={`motion-safe:transition motion-safe:duration-300 ${on ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'} ${className}`}>
            {children}
        </div>
    );
}
