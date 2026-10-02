const STATE = {
    idle: 'border-gray-200 bg-white hover:border-teal-400',
    selected: 'border-teal-600 bg-teal-50',
    correct: 'border-emerald-600 bg-emerald-50',
    wrong: 'border-rose-600 bg-rose-50',
};
const BADGE = { correct: '✓ Benar', wrong: '✗ Kurang tepat' };

/** state: idle | selected | correct | wrong. Status juga ditulis sebagai teks, tidak hanya warna. */
export default function QuizOption({ label, value, state = 'idle', selected = false, disabled, onSelect }) {
    return (
        <label className={`flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-5 py-3 text-left text-lg font-semibold transition focus-within:ring-2 focus-within:ring-teal-600 ${STATE[state]} ${disabled ? 'cursor-default' : ''}`}>
            <span className="flex items-center gap-3">
                <input type="radio" name="quiz-answer" value={value} checked={selected} disabled={disabled} onChange={onSelect} className="h-5 w-5 flex-none text-teal-700 focus:ring-teal-600" />
                {label}
            </span>
            {BADGE[state] && <span className={`text-sm ${state === 'correct' ? 'text-emerald-800' : 'text-rose-800'}`}>{BADGE[state]}</span>}
        </label>
    );
}
