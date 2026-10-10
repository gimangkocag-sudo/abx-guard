import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                abx: {
                    navy: 'rgb(var(--abx-navy) / <alpha-value>)',
                    primary: 'rgb(var(--abx-primary) / <alpha-value>)',
                    light: 'rgb(var(--abx-light-blue) / <alpha-value>)',
                    background: 'rgb(var(--abx-pale) / <alpha-value>)',
                },
                teal: {
                    50: 'rgb(var(--abx-pale) / <alpha-value>)',
                    100: 'rgb(var(--abx-light-blue) / <alpha-value>)',
                    200: 'rgb(187 218 247 / <alpha-value>)',
                    300: 'rgb(132 184 226 / <alpha-value>)',
                    400: 'rgb(72 139 195 / <alpha-value>)',
                    500: 'rgb(var(--abx-primary) / <alpha-value>)',
                    600: 'rgb(var(--abx-primary) / <alpha-value>)',
                    700: 'rgb(var(--abx-primary) / <alpha-value>)',
                    800: 'rgb(var(--abx-navy) / <alpha-value>)',
                    900: 'rgb(17 45 85 / <alpha-value>)',
                    950: 'rgb(12 36 68 / <alpha-value>)',
                },
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
