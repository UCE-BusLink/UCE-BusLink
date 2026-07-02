/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#07111f',
          900: '#0a1628',
          800: '#0d2040',
          700: '#1a3a5c',
        },
      },
    },
  },
  plugins: [],
};
