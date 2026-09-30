const STATE = {
    idle: 'border-gray-200 bg-white hover:border-teal-400',
    selected: 'border-teal-600 bg-teal-50',
    correct: 'border-emerald-600 bg-emerald-50',
    wrong: 'border-rose-600 bg-rose-50',
};
const BADGE = { correct: '✓ Benar', wrong: '✗ Kurang tepat' };

/** state: idle | selected | correct | wrong. Status juga ditulis sebagai teks, tidak hanya warna. */
export default function QuizOption({ label, state = 'idle', disabled, onSelect }) {
    return (
        <button type="button" role="radio" aria-checked={state !== 'idle'} disabled={disabled} onClick={onSelect}
            className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border-2 px-5 py-3 text-left text-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-default ${STATE[state]}`}>
            <span>{label}</span>
            {BADGE[state] && <span className={`text-sm ${state === 'correct' ? 'text-emerald-800' : 'text-rose-800'}`}>{BADGE[state]}</span>}
        </button>
    );
}
