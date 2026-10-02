export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex min-h-11 items-center justify-center rounded-lg border border-transparent bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition duration-150 ease-in-out hover:bg-teal-800 focus:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 active:bg-teal-900 ${
                    disabled && 'cursor-not-allowed opacity-60'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
