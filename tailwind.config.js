/** @type {import('tailwindcss').Config} */

export default {
    content: ['./node_modules/preline/preline.js'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Bai Jamjuree"', '"Bai Jamjuree fallback"', 'sans-serif'],
                title: ['"Noto Sans Thai"', '"Noto Sans Thai fallback"', 'sans-serif'],
            },
        },
    },
    plugins: [require('preline/plugin'), require('@tailwindcss/forms')],
}
