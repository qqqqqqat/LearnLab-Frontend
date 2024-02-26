/** @type {import('tailwindcss').Config} */
export default {
  content: ['./node_modules/preline/preline.js',],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Thai"', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('preline/plugin'),
  ],
}

